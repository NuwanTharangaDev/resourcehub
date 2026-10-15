import { Prisma, ReservationStatus, ResourceCategory, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { colomboToDate, dayRange } from "@/lib/dates";
import type { AvailabilityInput, ReservationInput } from "@/lib/validations";

const PAGE_SIZE = 10;

type Actor = { id: string; role: Role };

function isOverlapError(error: unknown) {
  const text = error instanceof Error ? error.message : "";
  return (
    text.includes("Reservation_no_overlap") ||
    text.includes("exclusion constraint") ||
    text.includes("23P01")
  );
}

export async function createReservation(input: ReservationInput, userId: string) {
  const startAt = colomboToDate(input.date, input.startTime);
  const endAt = colomboToDate(input.date, input.endTime);

  if (Number.isNaN(startAt.getTime()) || endAt <= startAt) {
    throw new AppError("End time must be after start time");
  }
  if (startAt < new Date()) {
    throw new AppError("Reservations can't start in the past");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<{ isActive: boolean }[]>`
        SELECT "isActive" FROM "Resource" WHERE id = ${input.resourceId} FOR SHARE`;

      if (rows.length === 0) throw new AppError("Resource not found");
      if (!rows[0].isActive) throw new AppError("This resource is inactive and can't be booked");

      return tx.reservation.create({
        data: { resourceId: input.resourceId, userId, title: input.title, startAt, endAt },
      });
    });
  } catch (error) {
    if (isOverlapError(error)) {
      throw new AppError("That time slot was just taken. Please choose another time or resource.");
    }
    throw error;
  }
}

export async function cancelReservation(id: string, actor: Actor) {
  const reservation = await prisma.reservation.findUnique({ where: { id } });

  if (!reservation) throw new AppError("Reservation not found");
  if (actor.role !== "ADMIN" && reservation.userId !== actor.id) {
    throw new AppError("You can only cancel your own reservations");
  }
  if (reservation.status !== "CONFIRMED") {
    throw new AppError("Only confirmed reservations can be cancelled");
  }
  if (reservation.startAt <= new Date()) {
    throw new AppError("This reservation has already started");
  }

  const result = await prisma.reservation.updateMany({
    where: { id, status: "CONFIRMED" },
    data: { status: "CANCELLED" },
  });
  if (result.count === 0) throw new AppError("This reservation was already changed");
}

export function markFinishedReservations() {
  return prisma.reservation.updateMany({
    where: { status: "CONFIRMED", endAt: { lt: new Date() } },
    data: { status: "COMPLETED" },
  });
}

type ReservationFilters = {
  resourceId?: string;
  status?: ReservationStatus;
  date?: string;
  search?: string;
  when?: "upcoming" | "past";
  userId?: string;
  page?: number;
};

export async function listReservations(filters: ReservationFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const now = new Date();
  const and: Prisma.ReservationWhereInput[] = [];

  if (filters.date) {
    const { start, end } = dayRange(filters.date);
    and.push({ startAt: { lt: end }, endAt: { gt: start } });
  }
  if (filters.when === "upcoming") and.push({ endAt: { gt: now } });
  if (filters.when === "past") and.push({ endAt: { lte: now } });
  if (filters.search) and.push({ title: { contains: filters.search, mode: "insensitive" } });

  const where: Prisma.ReservationWhereInput = {
    resourceId: filters.resourceId,
    status: filters.status,
    userId: filters.userId,
    AND: and,
  };

  const [items, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      orderBy: { startAt: filters.when === "past" ? "desc" : "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        resource: { select: { id: true, name: true } },
        user: { select: { name: true } },
      },
    }),
    prisma.reservation.count({ where }),
  ]);

  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getReservation(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
    include: { resource: true, user: { select: { name: true, email: true } } },
  });
}

export async function getAvailability(input: AvailabilityInput) {
  const { start, end } = dayRange(input.date);
  const startAt = colomboToDate(input.date, input.startTime);
  const endAt = colomboToDate(input.date, input.endTime);

  const resources = await prisma.resource.findMany({
    where: { isActive: true, category: input.category as ResourceCategory | undefined },
    orderBy: { name: "asc" },
    include: {
      reservations: {
        where: { status: { not: "CANCELLED" }, startAt: { lt: end }, endAt: { gt: start } },
        orderBy: { startAt: "asc" },
        select: { id: true, title: true, startAt: true, endAt: true },
      },
    },
  });

  return resources.map((resource) => ({
    ...resource,
    available: !resource.reservations.some((r) => r.startAt < endAt && r.endAt > startAt),
  }));
}
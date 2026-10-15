import { prisma } from "@/lib/prisma";
import { dayRange, todayInColombo } from "@/lib/dates";

const withNames = {
  resource: { select: { name: true } },
  user: { select: { name: true } },
};

export async function getDashboardData() {
  const now = new Date();
  const { start, end } = dayRange(todayInColombo());

  const [activeResources, todayCount, upcomingCount, inUse, upcoming, recent] = await Promise.all([
    prisma.resource.count({ where: { isActive: true } }),
    prisma.reservation.count({
      where: { status: { not: "CANCELLED" }, startAt: { gte: start, lt: end } },
    }),
    prisma.reservation.count({ where: { status: "CONFIRMED", startAt: { gt: now } } }),
    prisma.reservation.findMany({
      where: { status: "CONFIRMED", startAt: { lte: now }, endAt: { gt: now }, resource: { isActive: true } },
      distinct: ["resourceId"],
      select: { resourceId: true },
    }),
    prisma.reservation.findMany({
      where: { status: "CONFIRMED", endAt: { gt: now } },
      orderBy: { startAt: "asc" },
      take: 5,
      include: withNames,
    }),
    prisma.reservation.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: withNames,
    }),
  ]);

  return {
    activeResources,
    todayCount,
    upcomingCount,
    freeNow: activeResources - inUse.length,
    upcoming,
    recent,
  };
}
import { Prisma, ResourceCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import type { ResourceInput } from "@/lib/validations";

const PAGE_SIZE = 10;

type ResourceFilters = {
  search?: string;
  category?: ResourceCategory;
  status?: "active" | "inactive";
  page?: number;
};

export async function listResources({ search, category, status, page = 1 }: ResourceFilters) {
  const currentPage = Math.max(1, page);
  const where: Prisma.ResourceWhereInput = {
    name: search ? { contains: search, mode: "insensitive" } : undefined,
    category,
    isActive: status ? status === "active" : undefined,
  };

  const [items, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.resource.count({ where }),
  ]);

  return { items, total, page: currentPage, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export function getResource(id: string) {
  return prisma.resource.findUnique({
    where: { id },
    include: {
      reservations: {
        where: { status: "CONFIRMED", endAt: { gt: new Date() } },
        orderBy: { startAt: "asc" },
        take: 10,
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export function listActiveResources() {
  return prisma.resource.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, category: true },
  });
}

function toData(input: ResourceInput) {
  return {
    name: input.name,
    category: input.category,
    location: input.location,
    description: input.description || null,
    capacity: input.capacity ?? null,
  };
}

function saveError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return new AppError("A resource with this name already exists");
    if (error.code === "P2025") return new AppError("Resource not found");
  }
  return error;
}

export async function createResource(input: ResourceInput) {
  try {
    return await prisma.resource.create({ data: toData(input) });
  } catch (error) {
    throw saveError(error);
  }
}

export async function updateResource(id: string, input: ResourceInput) {
  try {
    return await prisma.resource.update({ where: { id }, data: toData(input) });
  } catch (error) {
    throw saveError(error);
  }
}

export async function setResourceActive(id: string, isActive: boolean) {
  try {
    return await prisma.resource.update({ where: { id }, data: { isActive } });
  } catch (error) {
    throw saveError(error);
  }
}
export function listResourceOptions() {
  return prisma.resource.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
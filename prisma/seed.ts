import { PrismaClient, ReservationStatus, ResourceCategory, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, colomboToDate, todayInColombo } from "../src/lib/dates";

const prisma = new PrismaClient();

const users = [
  { name: "Admin User", email: "admin@resourcehub.test", role: Role.ADMIN },
  { name: "Nimal Perera", email: "nimal@resourcehub.test", role: Role.MEMBER },
  { name: "Kavindi Silva", email: "kavindi@resourcehub.test", role: Role.MEMBER },
];

const resources = [
  { name: "Conference Room A", category: ResourceCategory.ROOM, location: "Floor 2", capacity: 12, description: "Large room with a wall display" },
  { name: "Meeting Room B", category: ResourceCategory.ROOM, location: "Floor 1", capacity: 6, description: "Small room for quick meetings" },
  { name: "Training Room", category: ResourceCategory.ROOM, location: "Floor 3", capacity: 25, description: "Classroom-style seating" },
  { name: "Projector 01", category: ResourceCategory.EQUIPMENT, location: "IT store", capacity: null, description: "Portable HD projector" },
  { name: "Shared Equipment", category: ResourceCategory.EQUIPMENT, location: "IT store", capacity: null, description: "Cameras, tripods and microphones" },
  { name: "Meeting Room C", category: ResourceCategory.ROOM, location: "Floor 1", capacity: 4, description: "Closed for renovation", isActive: false },
];

const bookings = [
  { resource: "Conference Room A", user: "admin@resourcehub.test", title: "Quarterly planning", day: -2, start: "09:00", end: "11:00", status: ReservationStatus.COMPLETED },
  { resource: "Conference Room A", user: "nimal@resourcehub.test", title: "Client demo prep", day: 0, start: "14:00", end: "15:30", status: ReservationStatus.CONFIRMED },
  { resource: "Conference Room A", user: "kavindi@resourcehub.test", title: "Sprint review", day: 1, start: "10:00", end: "11:00", status: ReservationStatus.CONFIRMED },
  { resource: "Meeting Room B", user: "nimal@resourcehub.test", title: "One to one catch up", day: 0, start: "11:00", end: "12:00", status: ReservationStatus.CONFIRMED },
  { resource: "Meeting Room B", user: "kavindi@resourcehub.test", title: "Design workshop", day: 2, start: "13:00", end: "16:00", status: ReservationStatus.CONFIRMED },
  { resource: "Meeting Room B", user: "nimal@resourcehub.test", title: "Budget review", day: 1, start: "15:00", end: "16:00", status: ReservationStatus.CANCELLED },
  { resource: "Projector 01", user: "nimal@resourcehub.test", title: "Client demo prep", day: 0, start: "14:00", end: "15:30", status: ReservationStatus.CONFIRMED },
  { resource: "Projector 01", user: "kavindi@resourcehub.test", title: "Training session", day: 3, start: "09:00", end: "12:00", status: ReservationStatus.CONFIRMED },
  { resource: "Training Room", user: "kavindi@resourcehub.test", title: "New joiner orientation", day: 1, start: "09:00", end: "13:00", status: ReservationStatus.CONFIRMED },
  { resource: "Training Room", user: "nimal@resourcehub.test", title: "Onboarding refresher", day: -1, start: "10:00", end: "12:00", status: ReservationStatus.COMPLETED },
  { resource: "Shared Equipment", user: "admin@resourcehub.test", title: "Site survey kit", day: 2, start: "08:00", end: "17:00", status: ReservationStatus.CONFIRMED },
];

async function main() {
  const password = process.env.SEED_PASSWORD;
  if (!password) {
    throw new Error("Set SEED_PASSWORD in .env before seeding");
  }
  const passwordHash = await bcrypt.hash(password, 10);

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, passwordHash },
    });
  }

  for (const resource of resources) {
    await prisma.resource.upsert({
      where: { name: resource.name },
      update: {},
      create: resource,
    });
  }

  if ((await prisma.reservation.count()) > 0) {
    console.log("Reservations already exist, skipping them");
    return;
  }

  const userRows = await prisma.user.findMany();
  const resourceRows = await prisma.resource.findMany();
  const today = todayInColombo();

  for (const booking of bookings) {
    const date = addDays(today, booking.day);
    await prisma.reservation.create({
      data: {
        resourceId: resourceRows.find((r) => r.name === booking.resource)!.id,
        userId: userRows.find((u) => u.email === booking.user)!.id,
        title: booking.title,
        startAt: colomboToDate(date, booking.start),
        endAt: colomboToDate(date, booking.end),
        status: booking.status,
      },
    });
  }

  console.log("Seed finished");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
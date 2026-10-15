import { z } from "zod";

export const categories = ["ROOM", "EQUIPMENT", "VEHICLE", "OTHER"] as const;

const dateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date")
  .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()), "Pick a valid date");

const timeField = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Pick a time");

function endIsAfterStart(data: { startTime: string; endTime: string }) {
  return data.endTime > data.startTime;
}

const endError = { message: "End time must be after start time", path: ["endTime"] };

export const resourceSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name is too long"),
  category: z.enum(categories),
  location: z.string().trim().min(2, "Enter a location").max(120, "Location is too long"),
  description: z.string().trim().max(500, "Description is too long").optional(),
  capacity: z.number({ invalid_type_error: "Capacity must be a number" }).int("Capacity must be a whole number").min(1, "Capacity must be at least 1").max(1000, "Capacity is too large").optional(),
});

export const reservationSchema = z
  .object({
    resourceId: z.string().min(1, "Select a resource"),
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
    date: dateField,
    startTime: timeField,
    endTime: timeField,
  })
  .refine(endIsAfterStart, endError);

export const availabilitySchema = z
  .object({
    date: dateField,
    startTime: timeField,
    endTime: timeField,
    category: z.enum(categories).optional(),
  })
  .refine(endIsAfterStart, endError);

export type ResourceInput = z.infer<typeof resourceSchema>;
export type ReservationInput = z.infer<typeof reservationSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
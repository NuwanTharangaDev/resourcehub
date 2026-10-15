"use server";

"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { AppError, type FormState } from "@/lib/errors";
import { reservationSchema } from "@/lib/validations";
import { cancelReservation, createReservation } from "@/services/reservation-service";

export async function createReservationAction(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const user = await requireUser();

  const values = {
    resourceId: String(formData.get("resourceId") ?? ""),
    title: String(formData.get("title") ?? ""),
    date: String(formData.get("date") ?? ""),
    startTime: String(formData.get("startTime") ?? ""),
    endTime: String(formData.get("endTime") ?? ""),
  };

  const parsed = reservationSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors, values };

  try {
    await createReservation(parsed.data, user.id);
  } catch (error) {
    if (error instanceof AppError) return { error: error.message, values };
    throw error;
  }

  revalidatePath("/reservations");
  revalidatePath("/dashboard");
  revalidatePath("/availability");
  return { success: "Reservation confirmed." };
}
export async function cancelReservationAction(id: string): Promise<FormState> {
  const user = await requireUser();

  try {
    await cancelReservation(id, user);
  } catch (error) {
    if (error instanceof AppError) return { error: error.message };
    throw error;
  }

  revalidatePath("/reservations", "layout");
  revalidatePath("/resources", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/availability");
  return { success: "Reservation cancelled." };
}
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { AppError, type FormState } from "@/lib/errors";
import { resourceSchema } from "@/lib/validations";
import { createResource, setResourceActive, updateResource } from "@/services/resource-service";

function readForm(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
  }

  const capacity = (values.capacity ?? "").trim();
  const parsed = resourceSchema.safeParse({
    name: values.name ?? "",
    category: values.category ?? "",
    location: values.location ?? "",
    description: values.description ?? "",
    capacity: capacity ? Number(capacity) : undefined,
  });

  return { parsed, values };
}

export async function createResourceAction(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const { parsed, values } = readForm(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors, values };

  let id: string;
  try {
    id = (await createResource(parsed.data)).id;
  } catch (error) {
    if (error instanceof AppError) return { error: error.message, values };
    throw error;
  }

  revalidatePath("/resources");
  redirect(`/resources/${id}`);
}

export async function updateResourceAction(
  id: string,
  _prev: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const { parsed, values } = readForm(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors, values };

  try {
    await updateResource(id, parsed.data);
  } catch (error) {
    if (error instanceof AppError) return { error: error.message, values };
    throw error;
  }

  revalidatePath("/resources");
  redirect(`/resources/${id}`);
}

export async function toggleResourceAction(id: string, isActive: boolean) {
  await requireAdmin();
  await setResourceActive(id, isActive);
  revalidatePath("/resources");
  revalidatePath(`/resources/${id}`);
  revalidatePath("/availability");
}
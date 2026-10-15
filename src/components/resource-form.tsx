"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Resource } from "@prisma/client";
import type { FormState } from "@/lib/errors";
import { categoryLabels, inputClass, primaryButton, secondaryButton } from "@/lib/ui";
import { Field } from "./field";

type ResourceFormProps = {
  action: (prev: FormState | undefined, formData: FormData) => Promise<FormState>;
  resource?: Resource;
  cancelHref: string;
};

export function ResourceForm({ action, resource, cancelHref }: ResourceFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const errors = state?.fieldErrors ?? {};

  function value(name: string, saved: string | number | null | undefined) {
    return state?.values?.[name] ?? String(saved ?? "");
  }

  function aria(name: string) {
    return {
      "aria-invalid": errors[name] ? true : undefined,
      "aria-describedby": errors[name] ? `${name}-error` : undefined,
    };
  }

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      {state?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <Field label="Name" name="name" error={errors.name?.[0]}>
        <input id="name" name="name" defaultValue={value("name", resource?.name)} className={inputClass} {...aria("name")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" name="category" error={errors.category?.[0]}>
          <select id="category" name="category" defaultValue={value("category", resource?.category ?? "ROOM")} className={inputClass}>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Capacity (optional)" name="capacity" error={errors.capacity?.[0]}>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={value("capacity", resource?.capacity)}
            className={inputClass}
            {...aria("capacity")}
          />
        </Field>
      </div>

      <Field label="Location" name="location" error={errors.location?.[0]}>
        <input id="location" name="location" defaultValue={value("location", resource?.location)} className={inputClass} {...aria("location")} />
      </Field>

      <Field label="Description (optional)" name="description" error={errors.description?.[0]}>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={value("description", resource?.description)}
          className={inputClass}
          {...aria("description")}
        />
      </Field>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Saving..." : "Save resource"}
        </button>
        <Link href={cancelHref} className={secondaryButton}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
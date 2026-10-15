"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createReservationAction } from "@/app/(app)/reservations/actions";
import { inputClass, primaryButton } from "@/lib/ui";
import { Field } from "./field";

type ReservationFormProps = {
  resources: { id: string; name: string }[];
  defaultResourceId?: string;
  today: string;
};

export function ReservationForm({ resources, defaultResourceId, today }: ReservationFormProps) {
  const [state, formAction, pending] = useActionState(createReservationAction, undefined);
  const errors = state?.fieldErrors ?? {};

  function value(name: string, fallback = "") {
    return state?.values?.[name] ?? fallback;
  }

  function aria(name: string) {
    return {
      "aria-invalid": errors[name] ? true : undefined,
      "aria-describedby": errors[name] ? `${name}-error` : undefined,
    };
  }

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      {state?.success && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          {state.success}{" "}
          <Link href="/reservations" className="font-medium underline">
            View reservations
          </Link>
        </p>
      )}
      {state?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <Field label="Resource" name="resourceId" error={errors.resourceId?.[0]}>
        <select
          id="resourceId"
          name="resourceId"
          defaultValue={value("resourceId", defaultResourceId ?? "")}
          className={inputClass}
          {...aria("resourceId")}
        >
          <option value="">Select a resource</option>
          {resources.map((resource) => (
            <option key={resource.id} value={resource.id}>
              {resource.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Title or purpose" name="title" error={errors.title?.[0]}>
        <input id="title" name="title" defaultValue={value("title")} className={inputClass} {...aria("title")} />
      </Field>

      <Field label="Date" name="date" error={errors.date?.[0]}>
        <input id="date" name="date" type="date" min={today} defaultValue={value("date", today)} className={inputClass} {...aria("date")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start time" name="startTime" error={errors.startTime?.[0]}>
          <input id="startTime" name="startTime" type="time" defaultValue={value("startTime")} className={inputClass} {...aria("startTime")} />
        </Field>
        <Field label="End time" name="endTime" error={errors.endTime?.[0]}>
          <input id="endTime" name="endTime" type="time" defaultValue={value("endTime")} className={inputClass} {...aria("endTime")} />
        </Field>
      </div>

      <p className="text-xs text-slate-600">Times are in Sri Lanka time (Asia/Colombo).</p>

      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Booking..." : "Book resource"}
      </button>
    </form>
  );
}
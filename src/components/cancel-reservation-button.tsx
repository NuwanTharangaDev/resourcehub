"use client";

import { useActionState } from "react";
import { cancelReservationAction } from "@/app/(app)/reservations/actions";
import type { FormState } from "@/lib/errors";
import { ConfirmButton } from "./confirm-button";

const initialState: FormState = {};

export function CancelReservationButton({ id }: { id: string }) {
  const [state, action] = useActionState(cancelReservationAction.bind(null, id), initialState);

  return (
    <form action={action}>
      <ConfirmButton
        message="Cancel this reservation? The time slot will become available again."
        className="rounded text-sm font-medium text-red-700 hover:underline focus:outline-none focus:ring-2 focus:ring-red-600"
      >
        Cancel
      </ConfirmButton>
      {state.error && (
        <p role="alert" className="mt-1 text-xs text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
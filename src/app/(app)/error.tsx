"use client";

import { primaryButton } from "@/lib/ui";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center">
      <h1 className="text-lg font-semibold text-slate-900">Something went wrong</h1>
      <p className="mb-4 mt-1 text-sm text-slate-600">Please try again. If it keeps happening, contact an administrator.</p>
      <button onClick={reset} className={primaryButton}>
        Try again
      </button>
    </div>
  );
}
import { redirect } from "next/navigation";
import { CalendarCheck, Layers, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-slate-900 p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Layers className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-xl font-semibold tracking-tight text-white">ResourceHub</span>
        </div>

        <div>
          <h2 className="max-w-md text-4xl font-semibold leading-tight tracking-tight text-white">
            Book shared rooms and equipment without the double bookings.
          </h2>
          <ul className="mt-8 space-y-4 text-slate-300">
            <li className="flex items-center gap-3">
              <CalendarCheck className="h-5 w-5 text-blue-400" aria-hidden="true" />
              See what is free before you book
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-400" aria-hidden="true" />
              Conflicting bookings are blocked by the database
            </li>
          </ul>
        </div>

        <p className="text-sm text-slate-400">PrimeWave Lab technical assessment</p>
      </section>

      <section className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mb-6 mt-1 text-sm text-slate-600">Sign in to manage resources and reservations.</p>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <LoginForm />
          </div>
          <p className="mt-4 text-xs text-slate-600">
            Demo accounts: admin@resourcehub.test or nimal@resourcehub.test, with the SEED_PASSWORD from your .env.
          </p>
        </div>
      </section>
    </main>
  );
}
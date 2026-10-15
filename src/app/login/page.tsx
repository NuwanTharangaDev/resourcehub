import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">ResourceHub</h1>
        <p className="mb-6 mt-1 text-sm text-slate-600">Sign in to manage resources and reservations.</p>
        <LoginForm />
        <p className="mt-6 text-xs text-slate-500">
          Demo accounts use the password from SEED_PASSWORD, e.g. admin@resourcehub.test or nimal@resourcehub.test.
        </p>
      </div>
    </main>
  );
}
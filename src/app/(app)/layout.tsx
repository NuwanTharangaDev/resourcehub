import { Layers, LogOut } from "lucide-react";
import { requireUser } from "@/lib/session";
import { logout } from "@/app/login/actions";
import { NavLinks } from "@/components/sidebar";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
        <Layers className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="text-lg font-semibold tracking-tight text-white">ResourceHub</span>
    </div>
  );
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <header className="sticky top-0 z-10 bg-slate-900 px-4 py-3 md:hidden">
        <div className="mb-2 flex items-center justify-between">
          <Logo />
          <form action={logout}>
            <button
              type="submit"
              aria-label="Sign out"
              className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
        <NavLinks mobile />
      </header>

      <aside className="hidden w-64 shrink-0 flex-col justify-between bg-slate-900 p-4 md:sticky md:top-0 md:flex md:h-screen">
        <div>
          <div className="mb-8 px-2 pt-2">
            <Logo />
          </div>
          <NavLinks />
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-slate-400">{user.role === "ADMIN" ? "Administrator" : "Member"}</p>
            </div>
          </div>
          <form action={logout} className="mt-3">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
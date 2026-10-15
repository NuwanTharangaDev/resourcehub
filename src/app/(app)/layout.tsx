import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/session";
import { logout } from "@/app/login/actions";
import { NavLinks } from "@/components/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-slate-900 p-4 md:flex md:w-60 md:flex-col md:justify-between">
        <div>
          <p className="mb-4 px-3 text-lg font-bold text-white">ResourceHub</p>
          <NavLinks />
        </div>
        <div className="mt-4 border-t border-slate-700 pt-4 md:mt-0">
          <p className="px-3 text-sm font-medium text-white">{user.name}</p>
          <p className="px-3 text-xs text-slate-400">{user.role === "ADMIN" ? "Administrator" : "Member"}</p>
          <form action={logout} className="mt-2">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 bg-slate-50 p-4 md:p-8">{children}</main>
    </div>
  );
}
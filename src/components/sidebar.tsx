"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, CalendarSearch, LayoutDashboard, Package } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resources", label: "Resources", icon: Package },
  { href: "/reservations", label: "Reservations", icon: CalendarCheck },
  { href: "/availability", label: "Availability", icon: CalendarSearch },
];

export function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={mobile ? "Mobile" : "Main"}
      className={mobile ? "flex gap-1 overflow-x-auto pb-1" : "flex flex-col gap-1"}
    >
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className={`h-4 w-4 ${active ? "text-blue-400" : ""}`} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
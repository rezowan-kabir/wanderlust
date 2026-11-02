"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home", withIcon: false },
  { href: "/destinations", label: "Destinations", withIcon: false },
  { href: "/add-destination", label: "Add Destination", withIcon: false},
  { href: "/bookings", label: "My Bookings", withIcon: false },
  { href: "/admin", label: "Admin", withIcon: false },
];

const accountLinks = [
  { href: "/profile", label: "Profile", withIcon: true },
  { href: "/login", label: "Login", withIcon: false },
  { href: "/signup", label: "Sign Up", withIcon: false },
];

/**
 * Floating white bar that sits on top of the banner.
 * It is absolutely positioned, so its parent must be `relative`.
 */
export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-30 px-4 pt-4 sm:px-6">
      <nav className="relative flex items-center gap-4 rounded-md bg-white px-5 py-3 shadow-[0_2px_14px_rgba(0,0,0,0.18)] sm:px-7">
        {/* Brand is centred independently of the two link groups. */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-2xl font-bold tracking-tight text-brand sm:text-[27px]"
        >
          Wanderlast
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`border-b-2 pb-1 text-[15px] font-medium transition-colors ${
                    isActive
                      ? "border-brand text-brand"
                      : "border-transparent text-neutral-800 hover:border-neutral-200 hover:text-brand"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <ul className="ml-auto hidden items-center gap-6 lg:flex">
          {accountLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex items-center gap-1.5 text-[15px] font-medium text-neutral-800 transition-colors hover:text-brand"
              >
                {link.withIcon ? <User className="size-4" aria-hidden /> : null}
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="ml-auto inline-flex size-9 items-center justify-center rounded-md text-neutral-800 transition-colors hover:bg-neutral-100 lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open ? (
        <div className="mt-2 rounded-md bg-white p-2 shadow-[0_2px_14px_rgba(0,0,0,0.18)] lg:hidden">
          {[...navLinks, ...accountLinks].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-1.5 rounded px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-neutral-100 ${
                pathname === link.href ? "text-brand" : "text-neutral-800"
              }`}
            >
              {link.withIcon ? <User className="size-4" aria-hidden /> : null}
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}

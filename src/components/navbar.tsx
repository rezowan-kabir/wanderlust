"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User, X, LogOut } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/add-destination", label: "Add Destination" },
  { href: "/bookings", label: "My Bookings" },
  { href: "/admin", label: "Admin" },
];

/**
 * Floating white bar that sits on top of the banner.
 * It is absolutely positioned, so its parent must be `relative`.
 */
export function Navbar() {
  const {
    data: session,
    isPending, // loading state
    error, // error object
    refetch, // refetch the session
  } = authClient.useSession();

  const user = session?.user;
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

        {/* Main Nav Links */}
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

        {/* Individual Account Links / Auth State with Popover */}
        <div className="ml-auto hidden items-center gap-4 lg:flex">
          {isPending ? (
            <div className="h-8 w-20 animate-pulse rounded bg-neutral-200" />
          ) : user ? (
            // Logged In State: Popover Menu anchored to the Avatar
            <Popover>
              <PopoverTrigger className="inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[15px] font-medium text-neutral-800 transition-colors hover:bg-neutral-100 focus:outline-none">
                <Avatar className="size-8">
                  <AvatarImage
                    referrerPolicy="no-referrer"
                    src={user.image || ""}
                    alt={user.name || "User"}
                  />
                  <AvatarFallback>
                    {user.name ? (
                      user.name.charAt(0).toUpperCase()
                    ) : (
                      <User className="size-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <span>{user.name || "Account"}</span>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <PopoverHeader className="px-2 py-1.5 text-left">
                  <PopoverTitle className="text-sm font-semibold text-neutral-900">
                    {user.name || "My Account"}
                  </PopoverTitle>
                  <PopoverDescription className="text-xs text-neutral-500 truncate">
                    {user.email || ""}
                  </PopoverDescription>
                </PopoverHeader>

                <div className="my-1.5 border-t border-neutral-100" />

                <div className="flex flex-col gap-1">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
                  >
                    <User className="size-4" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      await authClient.signOut({
                        fetchOptions: {
                          onSuccess: () => {
                            window.location.href = "/login";
                          },
                        },
                      });
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            // Logged Out State: Individual Login & Sign Up Links
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-[15px] font-medium text-neutral-800 transition-colors hover:text-brand"
              >
                <User className="size-4" aria-hidden />
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-brand px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-brand/90"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
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

      {/* Mobile Menu Dropdown */}
      {open ? (
        <div className="mt-2 rounded-md bg-white p-2 shadow-[0_2px_14px_rgba(0,0,0,0.18)] lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-1.5 rounded px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-neutral-100 ${
                pathname === link.href ? "text-brand" : "text-neutral-800"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="my-1 border-t border-neutral-200" />

          {user ? (
            <>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded px-3 py-2.5 text-[15px] font-medium text-neutral-800 transition-colors hover:bg-neutral-100"
              >
                <User className="size-4" />
                Profile
              </Link>
              <button
                type="button"
                onClick={async () => {
                  setOpen(false);
                  await authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = "/login";
                      },
                    },
                  });
                }}
                className="flex w-full items-center gap-2 rounded px-3 py-2.5 text-[15px] font-medium text-red-600 transition-colors hover:bg-neutral-100"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 rounded px-3 py-2.5 text-[15px] font-medium text-neutral-800 transition-colors hover:bg-neutral-100"
              >
                <User className="size-4" />
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 rounded px-3 py-2.5 text-[15px] font-medium text-brand transition-colors hover:bg-neutral-100"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      ) : null}
    </header>
  );
}

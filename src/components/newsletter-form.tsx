"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

/** Email capture field with the diagonal submit arrow. */
export function NewsletterForm() {
  const [email, setEmail] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setEmail("");
      }}
      className="mt-4 flex h-11 w-full max-w-[290px] items-center gap-2 bg-[#262626] px-4"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Enter email"
        className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-neutral-500"
      />
      <button
        type="submit"
        aria-label="Subscribe to newsletter"
        className="shrink-0 text-white transition-colors hover:text-brand"
      >
        <ArrowUpRight className="size-5" aria-hidden />
      </button>
    </form>
  );
}

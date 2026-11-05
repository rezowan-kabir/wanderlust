"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GoogleIcon } from "@/components/google-icon";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

/** Light-slate fill shared by every input on this page. */
const fieldClass = "h-10 rounded-md border-slate-200 bg-slate-50 pl-9 text-sm placeholder:text-slate-400";

function IconInput({
  id,
  name,
  type,
  placeholder,
  icon,
  autoComplete,
  required = true,
}: {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  icon: React.ReactNode;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </span>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={fieldClass}
      />
    </div>
  );
}

/** "Welcome Back" sign-in form shown at /login. */
export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    setIsSubmitting(true);

    try {
      const { error } = await authClient.signIn.email({ email, password });

      if (error) {
        throw new Error(error.message ?? "Could not sign you in.");
      }

      toast.add({
        title: "Signed in",
        description: "Welcome back! Your adventure continues.",
        type: "success",
      });
      router.push("/");
    } catch (error) {
      toast.add({
        title: "Could not sign in",
        description: error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center bg-[#f4f6fa] px-4 pt-28 pb-20">
      <h1 className="text-center text-4xl font-serif font-bold text-slate-900">
        Welcome Back
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Resume your adventure with Wanderlust
      </p>

      <div className="mt-8 w-full max-w-[400px] rounded-xl border border-slate-100 bg-white p-7 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <form className="flex flex-col gap-4" onSubmit={signIn}>
          <Field>
            <FieldLabel htmlFor="email" className="font-semibold">
              Email Address
            </FieldLabel>
            <IconInput
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              icon={<Mail className="size-4" />}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password" className="font-semibold">
              Password
            </FieldLabel>
            <IconInput
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              icon={<Lock className="size-4" />}
            />
          </Field>

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <Checkbox />
              Remember me
            </label>
            <Link
              href="/login"
              className="text-sm font-medium text-brand hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 h-11 w-full bg-brand text-white hover:bg-brand/90"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </Button>

          <p className="mt-1 text-center text-sm text-slate-500">
            Or continue with
          </p>

          <Button
            type="button"
            variant="outline"
            className="h-11 w-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            <GoogleIcon className="size-4" />
            Sign Up With Google
          </Button>

          <div className="mt-1 h-px bg-slate-100" />

          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-brand hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

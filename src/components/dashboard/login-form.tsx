"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

type Props = {
  nextPath: string;
};

export function LoginForm({ nextPath }: Props) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      setFormError("Email or password is incorrect, or this account is inactive.");
      return;
    }

    router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-bark">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={cn(
            "h-10 w-full rounded-[8px] border border-mist bg-paper px-3 text-sm text-bark outline-none transition-colors placeholder:text-moss/70 focus-visible:border-resin focus-visible:ring-2 focus-visible:ring-resin/30",
            errors.email && "border-resin"
          )}
          placeholder="super admin email"
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" className="mt-1.5 text-sm text-resin" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-bark">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
          className={cn(
            "h-10 w-full rounded-[8px] border border-mist bg-paper px-3 text-sm text-bark outline-none transition-colors placeholder:text-moss/70 focus-visible:border-resin focus-visible:ring-2 focus-visible:ring-resin/30",
            errors.password && "border-resin"
          )}
          {...register("password")}
        />
        {errors.password && (
          <p id="password-error" className="mt-1.5 text-sm text-resin" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {formError && (
        <p className="rounded-[8px] border border-resin/40 bg-resin/10 px-3 py-2 text-sm text-bark" role="alert">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-10 w-full items-center justify-center rounded-[8px] bg-deodar text-sm font-medium text-paper transition-colors hover:bg-bark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

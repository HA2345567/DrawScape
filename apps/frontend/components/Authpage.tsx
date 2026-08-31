"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    // TODO: Connect your backend here
    console.log({
      email,
      password,
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLoading(false);
  };

  return (
    <main className="min-h-screen w-full bg-[#121212] text-white">
      <div className="flex min-h-screen">

        {/* ================= LEFT ================= */}
        <section className="relative hidden w-1/2 overflow-hidden border-r border-white/10 lg:flex">

          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
              `,
              backgroundSize: "32px 32px",
            }}
          />

          {/* Subtle glow */}
          <div className="absolute left-1/3 top-1/3 h-72 w-72 rounded-full bg-purple-500/10 blur-[120px]" />

          <div className="relative z-10 flex h-full w-full flex-col justify-between p-10 xl:p-14">

            {/* Logo */}
            <Logo size="md" theme="dark" />

            {/* Center content */}
            <div className="max-w-md">

              <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
                Draw your ideas.
                <br />
                <span className="text-zinc-500">
                  Make them real.
                </span>
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-6 text-zinc-500">
                A simple collaborative whiteboard for turning
                ideas into diagrams.
              </p>

            </div>

            {/* Footer */}
            <p className="text-xs text-zinc-600">
              © 2026 Drawscape
            </p>

          </div>
        </section>

        {/* ================= RIGHT ================= */}
        <section className="flex min-h-screen w-full items-center justify-center lg:w-1/2">

          <div className="w-full max-w-sm px-6 py-12 sm:px-8">

            {/* Mobile logo */}
            <div className="mb-12 lg:hidden">
              <Logo size="md" theme="dark" />
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight">
                {isSignin ? "Welcome back" : "Create an account"}
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                {isSignin
                  ? "Sign in to continue to your workspace."
                  : "Create your account to get started."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="
                    w-full rounded-lg
                    border border-white/10
                    bg-white/[0.03]
                    px-3.5 py-3
                    text-sm text-white
                    outline-none
                    transition
                    placeholder:text-zinc-600
                    focus:border-white/25
                    focus:bg-white/[0.05]
                    focus:ring-2
                    focus:ring-white/5
                  "
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-zinc-300"
                  >
                    Password
                  </label>

                  {isSignin && (
                    <Link
                      href="/forgot-password"
                      className="text-xs text-zinc-500 hover:text-white"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete={
                      isSignin
                        ? "current-password"
                        : "new-password"
                    }
                    className="
                      w-full rounded-lg
                      border border-white/10
                      bg-white/[0.03]
                      px-3.5 py-3 pr-16
                      text-sm text-white
                      outline-none
                      transition
                      placeholder:text-zinc-600
                      focus:border-white/25
                      focus:bg-white/[0.05]
                      focus:ring-2
                      focus:ring-white/5
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                      absolute right-3 top-1/2
                      -translate-y-1/2
                      text-xs text-zinc-500
                      hover:text-white
                    "
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full rounded-lg
                  bg-white
                  px-4 py-3
                  text-sm font-medium text-black
                  transition
                  hover:bg-zinc-200
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {loading
                  ? "Please wait..."
                  : isSignin
                  ? "Sign in"
                  : "Create account"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />

              <span className="text-xs text-zinc-600">
                OR
              </span>

              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Google */}
            <button
              type="button"
              className="
                flex w-full items-center
                justify-center gap-3
                rounded-lg
                border border-white/10
                bg-white/[0.03]
                px-4 py-3
                text-sm font-medium text-zinc-300
                transition
                hover:bg-white/[0.06]
                hover:text-white
              "
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21.35 12.27c0-.68-.06-1.35-.18-1.98H12v3.75h5.22a4.47 4.47 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.93-4.2 2.93-7.16Z"
                  fill="currentColor"
                />
                <path
                  d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.75 9.75 0 0 0 12 21.5Z"
                  fill="currentColor"
                />
                <path
                  d="M6.53 13.58a5.86 5.86 0 0 1 0-3.16V7.89H3.28a9.75 9.75 0 0 0 0 8.22l3.25-2.53Z"
                  fill="currentColor"
                />
                <path
                  d="M12 6.39c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.49 14.62 2.5 12 2.5a9.75 9.75 0 0 0-8.72 5.39l3.25 2.53C7.3 8.11 9.46 6.39 12 6.39Z"
                  fill="currentColor"
                />
              </svg>

              Continue with Google
            </button>

            {/* Switch */}
            <p className="mt-7 text-center text-sm text-zinc-500">
              {isSignin
                ? "Don't have an account?"
                : "Already have an account?"}{" "}

              <Link
                href={isSignin ? "/signup" : "/signin"}
                className="font-medium text-white hover:text-zinc-300"
              >
                {isSignin ? "Sign up" : "Sign in"}
              </Link>
            </p>

            {/* Terms */}
            <p className="mt-6 text-center text-xs leading-5 text-zinc-600">
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                className="underline hover:text-zinc-400"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline hover:text-zinc-400"
              >
                Privacy Policy
              </Link>
              .
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}
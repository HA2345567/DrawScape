"use client";

import React, { useState } from "react";
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

    // Backend submission placeholder
    console.log({ email, password });
    await new Promise((resolve) => setTimeout(resolve, 800));

    setLoading(false);
  };

  return (
    <main className="h-screen w-full bg-white text-[#0d253d] flex font-sans selection:bg-[#533afd]/15 selection:text-[#533afd] overflow-hidden">
      <div className="flex h-full w-full">
        
        {/* ========================================================================= */}
        {/* LEFT BRAND PANEL (Fixed Viewport • Deep Navy)                             */}
        {/* ========================================================================= */}
        <section className="relative hidden w-1/2 overflow-hidden bg-[#0d253d] text-white lg:flex flex-col justify-between p-8 xl:p-10 border-r border-[#e3e8ee] h-full">
          
          {/* Subtle Grid Background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, #533afd 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Ambient Glow */}
          <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-[#533afd]/20 blur-[120px] pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10 shrink-0">
            <Logo size="md" theme="dark" />
          </div>

          {/* Center Showcase */}
          <div className="relative z-10 max-w-lg my-auto py-2 shrink">
            <h1 className="text-[26px] xl:text-[30px] font-light tracking-tight leading-[1.2] mb-2 text-white">
              Visual whiteboard for modern software teams.
            </h1>

            <p className="text-xs xl:text-sm text-white/60 font-light leading-relaxed mb-4">
              Fast, collaborative architecture diagramming with a signature hand-drawn feel.
            </p>

            {/* Real Canvas Preview Container */}
            <div className="rounded-xl border border-white/15 overflow-hidden shadow-stripe-3 bg-[#091524] relative max-h-[280px] xl:max-h-[320px] flex items-center justify-center">
              <img
                src="/canvas-preview.png"
                alt="Drawscape Canvas Preview"
                className="w-full h-full object-cover opacity-95 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          {/* Footer Note */}
          <div className="relative z-10 flex items-center justify-between text-[11px] text-white/50 font-mono shrink-0">
            <span>● End-to-End Encrypted</span>
            <span>Open Source &bull; MIT</span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* RIGHT AUTH CARD PANEL (Fixed Viewport • Centered)                         */}
        {/* ========================================================================= */}
        <section className="flex h-full w-full items-center justify-center bg-[#f6f9fc] p-4 sm:p-6 lg:w-1/2 overflow-y-auto lg:overflow-hidden">
          
          <div className="w-full max-w-sm sm:max-w-md rounded-2xl bg-white p-6 sm:p-8 border border-[#e3e8ee] shadow-stripe-2 my-auto">
            
            {/* Mobile Logo */}
            <div className="mb-5 lg:hidden flex justify-center">
              <Logo size="md" />
            </div>

            {/* Header */}
            <div className="mb-5">
              <h2 className="text-2xl font-light tracking-heading-lg text-[#0d253d]">
                {isSignin ? "Welcome back" : "Create an account"}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#64748d] font-light">
                {isSignin
                  ? "Sign in to access your diagrams and workspaces."
                  : "Start diagramming and collaborating with your team."}
              </p>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              
              {/* Google Button */}
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-full border border-[#e3e8ee] bg-white px-3.5 py-2 text-xs font-medium text-[#0d253d] shadow-stripe-1 hover:bg-[#f6f9fc] transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Google</span>
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-full border border-[#e3e8ee] bg-white px-3.5 py-2 text-xs font-medium text-[#0d253d] shadow-stripe-1 hover:bg-[#f6f9fc] transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </button>

            </div>

            {/* Hairline Divider */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e3e8ee]" />
              </div>
              <span className="relative bg-white px-2.5 text-[10px] font-mono text-[#64748d] uppercase tracking-wider">
                or with email
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-[#273951] mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-[#e3e8ee] bg-white px-3.5 py-2 text-sm text-[#0d253d] placeholder:text-[#64748d]/60 outline-none transition-all focus:border-[#533afd] focus:ring-4 focus:ring-[#533afd]/10"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="password"
                    className="text-xs font-medium text-[#273951]"
                  >
                    Password
                  </label>

                  {isSignin && (
                    <Link
                      href="/forgot-password"
                      className="text-xs text-[#533afd] hover:underline"
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
                    placeholder="••••••••••••"
                    required
                    autoComplete={isSignin ? "current-password" : "new-password"}
                    className="w-full rounded-xl border border-[#e3e8ee] bg-white px-3.5 py-2 pr-14 text-sm text-[#0d253d] placeholder:text-[#64748d]/60 outline-none transition-all focus:border-[#533afd] focus:ring-4 focus:ring-[#533afd]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#64748d] hover:text-[#0d253d] font-medium"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Single-Indigo CTA Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#533afd] hover:bg-[#4434d4] active:bg-[#2e2b8c] text-white py-2.5 px-4 font-medium text-sm shadow-stripe-1 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1 cursor-pointer"
              >
                <span>{loading ? "Authenticating..." : isSignin ? "Sign in to Drawscape" : "Create Drawscape Account"}</span>
                <span>→</span>
              </button>
            </form>

            {/* Switch Signin / Signup */}
            <p className="mt-4 text-center text-xs text-[#64748d]">
              {isSignin ? "Don't have an account?" : "Already have an account?"}{" "}
              <Link
                href={isSignin ? "/signup" : "/signin"}
                className="font-medium text-[#533afd] hover:underline"
              >
                {isSignin ? "Sign up free" : "Sign in"}
              </Link>
            </p>

            {/* Terms */}
            <p className="mt-3 text-center text-[10px] text-[#64748d] leading-relaxed">
              By proceeding, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-[#0d253d]">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-[#0d253d]">
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
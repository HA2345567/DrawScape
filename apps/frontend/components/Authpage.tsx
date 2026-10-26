"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HTTP_BACKEND } from "@/config";
import { Logo } from "./Logo";
const nextPath = () => {
  const value = new URLSearchParams(window.location.search).get("next");
  return value && /^\/canvas(?:\/[a-zA-Z0-9_-]+)?$/.test(value) ? value : "/canvas";
};
export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [google, setGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    if (token) {
      localStorage.setItem("token", token);
      const next = nextPath();
      window.history.replaceState(null, "", "/signin");
      router.replace(next);
    }
    let active = true;
    void fetch(HTTP_BACKEND + "/api/v1/auth/providers").then(r => r.json()).then(data => {
      if (active) {
        setGoogle(Boolean(data.google));
        setError(new URLSearchParams(window.location.search).get("error"));
      }
    }).catch(() => { if (active) setGoogle(false); });
    return () => { active = false; };
  }, [router]);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError(null);
    try {
      const response = await fetch(HTTP_BACKEND + "/api/v1/" + (isSignin ? "signin" : "signup"), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password, ...(!isSignin ? { name } : {}) }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      if (!response.ok || !data.token) throw new Error(data.message || "Could not sign in.");
      localStorage.setItem("token", data.token);
      router.replace(nextPath());
    } catch (error) { setError(error instanceof Error ? error.message : "Could not connect. Please try again."); }
    finally { setLoading(false); }
  };
  const input = "w-full rounded-xl border border-[#dce1ea] px-4 py-3 text-sm text-[#0d253d] outline-none focus:border-[#533afd] focus:ring-2 focus:ring-[#533afd]/15";
  return <main className="min-h-screen bg-[#f6f9fc] text-[#0d253d] lg:flex">
    <section className="relative hidden min-h-screen w-1/2 flex-col justify-between overflow-hidden bg-[#0d253d] p-12 text-white lg:flex">
      <Logo size="md" theme="dark" />
      <div className="relative z-10"><p className="mb-4 text-sm text-[#a5a3ff]">A shared space for your next idea</p><h1 className="mb-6 text-5xl font-light leading-tight">Think together.<br />Draw something great.</h1><p className="mb-8 max-w-md text-white/65">Sketch architecture, map a flow, and share a canvas with your team.</p>
      <Image src="/canvas-preview.png" alt="Drawscape canvas editor" width={1000} height={650} className="rounded-2xl border border-white/10 shadow-2xl" /></div>
      <p className="text-xs text-white/50">Collaborate through a shared room link.</p>
    </section>
    <section className="flex min-h-screen flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-[#e3e8ee] bg-white p-8 shadow-xl shadow-[#0d253d]/5">
        <Logo size="md" theme="light" />
        <h2 className="text-3xl font-light">{isSignin ? "Welcome back" : "Create your account"}</h2>
        <p className="mb-8 mt-2 text-sm text-slate-500">{isSignin ? "Your next idea starts here." : "Start sketching and invite your team."}</p>
        {google && <button type="button" onClick={() => { window.location.href = HTTP_BACKEND + "/api/v1/auth/google?next=" + encodeURIComponent(nextPath()); }} className="mb-5 w-full rounded-xl border border-slate-200 py-3 text-sm hover:bg-slate-50">Continue with Google</button>}
        {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <form onSubmit={submit} className="space-y-5">
          {!isSignin && <label className="block text-sm">Full name<input className={input + " mt-2"} value={name} onChange={e => setName(e.target.value)} required maxLength={100} autoComplete="name" /></label>}
          <label className="block text-sm">Email<input type="email" className={input + " mt-2"} value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} autoComplete="email" /></label>
          <label className="block text-sm">Password<div className="relative mt-2"><input type={showPassword ? "text" : "password"} className={input + " pr-16"} value={password} onChange={e => setPassword(e.target.value)} required minLength={isSignin ? 1 : 10} maxLength={128} autoComplete={isSignin ? "current-password" : "new-password"} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-xs text-slate-500">{showPassword ? "Hide" : "Show"}</button></div>{!isSignin && <span className="mt-2 block text-xs text-slate-500">Use at least 10 characters.</span>}</label>
          <button disabled={loading} className="w-full rounded-full bg-[#533afd] py-3 text-sm font-medium text-white hover:bg-[#4434d4] disabled:opacity-60">{loading ? "Please wait..." : isSignin ? "Sign in" : "Create account"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">{isSignin ? "New to Drawscape?" : "Already have an account?"} <Link href={isSignin ? "/signup" : "/signin"} className="font-medium text-[#533afd]">{isSignin ? "Create an account" : "Sign in"}</Link></p>
      </div>
    </section>
  </main>;
}

import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/Logo";
const features = [
  ["A canvas for every idea", "Draw shapes, arrows, freehand strokes, and text. Add images to give your ideas context."],
  ["Made for collaboration", "Invite a teammate with a room link and see their changes on your shared canvas."],
  ["Pick up where you left off", "Canvas changes are saved to PostgreSQL and restored when you return."],
  ["Stay in flow", "Move, resize, erase, undo, redo, pan, and zoom with familiar shortcuts."],
];
export default function Home() {
  return <main className="min-h-screen bg-[#f6f9fc] text-[#0d253d]">
    <section className="relative overflow-hidden bg-[#0d253d] text-white">
      <Image src="/hero-bg.png" alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d253d]/50 to-[#0d253d]" />
      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-7">
        <Logo size="md" theme="dark" />
        <nav className="flex items-center gap-6 text-sm"><Link href="/signin" className="hover:text-indigo-200">Sign in</Link><Link href="/signup" className="rounded-full bg-[#533afd] px-5 py-2.5 hover:bg-[#665efd]">Start drawing</Link></nav>
      </header>
      <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-20 text-center">
        <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-indigo-200">A shared space for clear thinking</span>
        <h1 className="mx-auto mb-6 mt-9 max-w-4xl text-5xl font-light tracking-tight sm:text-7xl">Think freely.<br />Make ideas come alive.</h1>
        <p className="mx-auto max-w-xl text-lg leading-relaxed text-white/65">Sketch software architecture, map your next workflow, and work through ideas together on one canvas.</p>
        <div className="mt-9 flex justify-center gap-4"><Link href="/signup" className="rounded-full bg-[#533afd] px-7 py-3.5 text-sm font-medium hover:bg-[#665efd]">Create your first canvas</Link><a href="#features" className="rounded-full border border-white/20 px-7 py-3.5 text-sm hover:bg-white/5">Explore the editor</a></div>
        <Image src="/canvas-preview.png" alt="Drawscape diagram editor with shapes and connectors" width={1400} height={900} priority className="mt-16 rounded-2xl border border-white/15 shadow-2xl" />
      </div>
    </section>
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <p className="mb-4 text-sm font-medium text-[#533afd]">From rough thoughts to a shared picture</p>
      <h2 className="max-w-2xl text-4xl font-light leading-tight sm:text-5xl">Everything you need to sketch it out.</h2>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">{features.map(([title, description], index) => <article key={title} className="rounded-2xl border border-[#e3e8ee] bg-white p-8"><span className="text-sm font-mono text-[#533afd]">0{index + 1}</span><h3 className="mb-3 mt-6 text-xl font-medium">{title}</h3><p className="text-sm leading-7 text-slate-500">{description}</p></article>)}</div>
    </section>
    <section className="mx-6 mb-16 rounded-3xl bg-[#e9e7ff] px-6 py-16 text-center"><h2 className="text-4xl font-light">Your next idea deserves a canvas.</h2><Link href="/signup" className="mt-8 inline-block rounded-full bg-[#533afd] px-7 py-3.5 text-sm text-white">Start drawing</Link></section>
    <footer className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 text-xs text-slate-500"><span>Drawscape - built for shared ideas.</span><a href="https://github.com/HA2345567/DrawScape" target="_blank" rel="noreferrer" className="hover:text-[#533afd]">View source on GitHub</a></footer>
  </main>;
}

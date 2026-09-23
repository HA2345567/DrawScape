"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function DrawscapeLandingPage() {
  const [activeTab, setActiveTab] = useState<string>("architecture");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white text-[#0d253d] flex flex-col font-sans selection:bg-[#533afd]/15 selection:text-[#533afd] relative">
      
      {/* ========================================================================= */}
      {/* 1. HEADER & HERO SECTION WITH ARTWORK BACKGROUND                          */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden bg-[#0d253d]">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-top sm:bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: `url('/hero-bg.png')` }}
        />

        {/* Sophisticated Ambient Overlay for Readability & Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071322]/45 via-[#07172b]/30 to-[#071529]/75 pointer-events-none" />

        {/* ======================================================================= */}
        {/* 2. TOP NAVIGATION BAR (Floating with Glassmorphism)                     */}
        {/* ======================================================================= */}
        <header className="relative z-50 w-full border-b border-white/15 backdrop-blur-md bg-white/10 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-8">
              <Logo size="md" theme="dark" />

              {/* Nav Links */}
              <nav className="hidden md:flex items-center gap-6 text-[14px] font-normal text-white/90">
                <a href="#features" className="hover:text-white transition-colors">Features</a>
                <a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a>
                <a href="#ai-engine" className="hover:text-white transition-colors">AI Engine</a>
                <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
              </nav>
            </div>

            {/* Right Actions: Single Filled Primary Pill */}
            <div className="flex items-center gap-4">
              <Link
                href="/signin"
                className="text-[14px] font-medium text-white/90 hover:text-white transition-colors px-2 py-1"
              >
                Sign In
              </Link>

              <Link
                href="/signup"
                className="bg-[#533afd] hover:bg-[#4434d4] active:bg-[#2e2b8c] text-white text-[14px] font-medium px-4 py-2 rounded-full shadow-lg shadow-indigo-950/40 border border-white/20 transition-all flex items-center gap-1.5"
              >
                <span>Start drawing</span>
                <span className="text-xs">→</span>
              </Link>
            </div>
          </div>
        </header>

        {/* ======================================================================= */}
        {/* 3. HERO SECTION                                                         */}
        {/* ======================================================================= */}
        <section className="relative z-10 pt-16 pb-20 sm:pt-20 sm:pb-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            
            {/* Subdued Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-[12px] font-medium mb-8 backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
              <span>Drawscape 2.0 Enterprise Engine</span>
              <span className="text-amber-200 font-semibold ml-1">Explore features →</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-[28px] sm:text-[40px] lg:text-[54px] font-light text-white tracking-tight leading-[1.2] mb-4 max-w-3xl mx-auto drop-shadow-[0_2px_14px_rgba(0,0,0,0.5)]">
              Think freely, draw anything,<br className="hidden sm:inline" /> and make ideas come alive.
            </h1>

            {/* Lead Body Description */}
            <p className="text-[16px] sm:text-[18px] font-light text-white/90 max-w-xl mx-auto leading-relaxed mb-8 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
              Fast, collaborative architecture diagramming with a signature hand-drawn feel.
            </p>

            {/* Single-Indigo CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
              <Link
                href="/signup"
                className="w-full sm:w-auto bg-[#533afd] hover:bg-[#4434d4] active:bg-[#2e2b8c] text-white text-[15px] font-medium px-6 py-2.5 rounded-full shadow-xl shadow-indigo-950/50 border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Start drawing free</span>
                <span>→</span>
              </Link>

              <a
                href="#product-preview"
                className="w-full sm:w-auto bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md text-[15px] font-medium px-6 py-2.5 rounded-full transition-all flex items-center justify-center gap-2"
              >
                <span>Watch product demo</span>
              </a>
            </div>

            {/* Quiet Metric Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-[13px] text-white/85 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-300 font-bold">✓</span>
                <span>Open-Source Core</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-300 font-bold">✓</span>
                <span>End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-300 font-bold">✓</span>
                <span>Zero Session Logging</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-300 font-bold">✓</span>
                <span className="tnum">100k+ Engineers</span>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 4. HERO VIDEO / WORKSPACE CONTAINER                                   */}
          {/* ===================================================================== */}
          <div id="product-preview" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
            <div className="relative rounded-2xl border border-white/20 bg-[#0d253d]/80 shadow-2xl backdrop-blur-sm aspect-video w-full overflow-hidden group">
              <img
                src="/canvas-preview.png"
                alt="Drawscape Canvas Preview"
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 5. TRUSTED BY SECTION (Subtle Logo Strip)                                 */}
      {/* ========================================================================= */}
      <section className="py-12 border-y border-[#e3e8ee] bg-[#f6f9fc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#64748d] mb-8 font-mono">
            Trusted by engineering teams at
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-60 grayscale hover:grayscale-0 hover:opacity-90 transition-all text-[#0d253d] font-bold text-lg sm:text-xl">
            <span>NETFLIX</span>
            <span>∞ Meta</span>
            <span>⚡ Supabase</span>
            <span>stripe</span>
            <span>reddit</span>
            <span>▲ Vercel</span>
            <span>Microsoft</span>
            <span>GitHub</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CORE FEATURES BAND ({colors.canvas-soft} #f6f9fc)                      */}
      {/* ========================================================================= */}
      <section id="features" className="py-24 bg-[#f6f9fc] border-b border-[#e3e8ee]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#533afd] bg-[#b9b9f9]/40 px-3 py-1 rounded-full">
              Core Capabilities
            </span>
            <h2 className="text-[36px] sm:text-[48px] font-light text-[#0d253d] tracking-display-xl leading-[1.1] mt-4 mb-4">
              Everything required to model complex distributed systems.
            </h2>
            <p className="text-[16px] text-[#64748d] font-light leading-relaxed">
              Engineered to eliminate friction between architectural ideation and formal system documentation.
            </p>
          </div>

          {/* 3-Column Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            
            {/* Card 1 */}
            <div className="p-8 bg-white rounded-xl border border-[#e3e8ee] shadow-stripe-1 flex flex-col justify-between hover:shadow-stripe-2 transition-shadow">
              <div>
                <div className="w-11 h-11 rounded-lg bg-[#533afd]/10 text-[#533afd] flex items-center justify-center mb-6">
                  <svg className="w-5 h-5 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  </svg>
                </div>
                <h3 className="text-[20px] font-light tracking-heading-md text-[#0d253d] mb-3">
                  Low-Friction Sketching
                </h3>
                <p className="text-[14px] text-[#64748d] leading-relaxed mb-6 font-light">
                  Vector strokes engineered for speed. Diagram systems, microservices, and database models without complex styling overhead.
                </p>
              </div>
              <div className="pt-4 border-t border-[#e3e8ee] text-[12px] text-[#533afd] font-medium flex items-center justify-between">
                <span>Rendering Styles</span>
                <span>Structured &bull; Precision</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-8 bg-white rounded-xl border border-[#e3e8ee] shadow-stripe-1 flex flex-col justify-between hover:shadow-stripe-2 transition-shadow">
              <div>
                <div className="w-11 h-11 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6">
                  <svg className="w-5 h-5 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <h3 className="text-[20px] font-light tracking-heading-md text-[#0d253d] mb-3">
                  Real-time State Sync
                </h3>
                <p className="text-[14px] text-[#64748d] leading-relaxed mb-6 font-light">
                  CRDT-powered synchronization ensures zero conflicts. Share session links instantly with full end-to-end payload encryption.
                </p>
              </div>
              <div className="pt-4 border-t border-[#e3e8ee] text-[12px] text-emerald-600 font-medium flex items-center justify-between">
                <span>Latency</span>
                <span>Sub-15ms WebSocket</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-8 bg-white rounded-xl border border-[#e3e8ee] shadow-stripe-1 flex flex-col justify-between hover:shadow-stripe-2 transition-shadow">
              <div>
                <div className="w-11 h-11 rounded-lg bg-[#ea2261]/10 text-[#ea2261] flex items-center justify-center mb-6">
                  <svg className="w-5 h-5 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <h3 className="text-[20px] font-light tracking-heading-md text-[#0d253d] mb-3">
                  Cloud Infrastructure Stencils
                </h3>
                <p className="text-[14px] text-[#64748d] leading-relaxed mb-6 font-light">
                  Standardized stencil sets for AWS, Google Cloud, Azure, Kubernetes, and database topology components.
                </p>
              </div>
              <div className="pt-4 border-t border-[#e3e8ee] text-[12px] text-[#ea2261] font-medium flex items-center justify-between">
                <span>Libraries</span>
                <span>Included System Stencils</span>
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* WARM CREAM INTERLUDE CARD ({colors.canvas-cream} #f5e9d4)            */}
          {/* ===================================================================== */}
          <div className="p-8 sm:p-12 rounded-2xl bg-[#f5e9d4] border border-[#e3e8ee] flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9b6829] bg-[#9b6829]/15 px-3 py-1 rounded-full">
                Workspace Infrastructure
              </span>
              <h3 className="text-[28px] sm:text-[34px] font-light tracking-display-lg text-[#0d253d] mt-3 mb-3">
                Persistent shared repositories and access control.
              </h3>
              <p className="text-[15px] text-[#64748d] leading-relaxed font-light">
                Organize system designs in centralized team repositories with audit logs, granular permission models, and document version history.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <Link
                href="/signup"
                className="w-full sm:w-auto bg-[#0d253d] hover:bg-[#1c1e54] text-white text-[14px] font-medium px-6 py-2.5 rounded-full shadow-stripe-1 transition-all text-center"
              >
                Get Started Free
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. AI ENGINE (Natural Language to Diagram)                                */}
      {/* ========================================================================= */}
      <section id="ai-engine" className="py-24 bg-white border-b border-[#e3e8ee]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Narrative */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#533afd]/10 text-[#533afd] border border-[#533afd]/20 px-3 py-1 rounded-full text-[12px] font-medium mb-4">
                <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                </svg>
                <span>Drawscape Diagram Engine</span>
              </div>
              
              <h2 className="text-[36px] sm:text-[48px] font-light text-[#0d253d] tracking-display-xl leading-[1.1] mb-6">
                Translate natural language requirements into architecture schemas.
              </h2>
              
              <p className="text-[16px] text-[#64748d] font-light leading-relaxed mb-8">
                Input infrastructure specifications, API interaction sequences, or database relations in standard text to generate connected topology trees automatically.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#533afd]/10 text-[#533afd] flex items-center justify-center text-xs font-semibold mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0d253d] text-[15px]">Text-to-Topology Generation</h4>
                    <p className="text-[13px] text-[#64748d] font-light">Produces structured flowcharts and interconnected nodes directly from text prompts.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#533afd]/10 text-[#533afd] flex items-center justify-center text-xs font-semibold mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0d253d] text-[15px]">Component Export</h4>
                    <p className="text-[13px] text-[#64748d] font-light">Export wireframes and layout structures to clean React JSX and Tailwind CSS specifications.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#533afd]/10 text-[#533afd] flex items-center justify-center text-xs font-semibold mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0d253d] text-[15px]">Bidirectional Mermaid & PlantUML Sync</h4>
                    <p className="text-[13px] text-[#64748d] font-light">Interoperate between code-defined diagram pipelines and visual canvas elements.</p>
                  </div>
                </div>
              </div>

              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-[#533afd] hover:bg-[#4434d4] text-white text-[14px] font-medium px-5 py-2.5 rounded-full shadow-stripe-1 transition-all"
              >
                <span>Launch Diagram Generator</span>
                <span>→</span>
              </Link>
            </div>

            {/* Right Image Container */}
            <div className="relative rounded-2xl border border-[#e3e8ee] bg-[#0d253d] shadow-stripe-3 overflow-hidden w-full flex items-center justify-center group">
              <img
                src="/canvas-preview.png"
                alt="Drawscape Canvas Workspace"
                className="w-full h-auto object-cover rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. INTERACTIVE USE CASES TAB SECTION                                      */}
      {/* ========================================================================= */}
      <section id="use-cases" className="py-24 bg-[#f6f9fc] border-b border-[#e3e8ee]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#533afd] bg-[#b9b9f9]/40 px-3 py-1 rounded-full">
              Workflows
            </span>
            <h2 className="text-[36px] sm:text-[48px] font-light text-[#0d253d] tracking-display-xl leading-[1.1] mt-4 mb-4">
              Built for technical design across the stack.
            </h2>
          </div>

          {/* Interactive Pill Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {[
              { id: "architecture", title: "System Architecture" },
              { id: "wireframe", title: "Product Layouts" },
              { id: "brainstorming", title: "Technical Retros" },
              { id: "interviews", title: "System Design Interviews" },
              { id: "presentations", title: "Architecture Reviews" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full font-medium text-[13px] transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#533afd] text-white shadow-stripe-1"
                    : "bg-white text-[#273951] border border-[#e3e8ee] hover:bg-[#f6f9fc]"
                }`}
              >
                <span>{tab.title}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Showcase */}
          <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#e3e8ee] shadow-stripe-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="bg-[#b9b9f9]/30 text-[#4434d4] text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Workflow Profile
                </span>
                
                <h3 className="text-[26px] sm:text-[30px] font-light text-[#0d253d] tracking-display-lg mt-3 mb-4">
                  {activeTab === "architecture" && "Model distributed topologies and database relationships"}
                  {activeTab === "wireframe" && "Rapid UI component structuring and view hierarchy"}
                  {activeTab === "brainstorming" && "Collaborative engineering retros and root-cause analysis"}
                  {activeTab === "interviews" && "Interactive environment for system design evaluation"}
                  {activeTab === "presentations" && "Technical slide documentation for architecture reviews"}
                </h3>

                <p className="text-[15px] text-[#64748d] font-light leading-relaxed mb-6">
                  {activeTab === "architecture" && "Communicate database schemas, microservice dependencies, and cloud topologies with clarity that engineering teams instantly understand."}
                  {activeTab === "wireframe" && "Iterate on component layouts and UX flows in seconds without premature styling overhead."}
                  {activeTab === "brainstorming" && "Structured canvas cards, connector trees, and real-time multiplayer cursor feedback for sprint retros."}
                  {activeTab === "interviews" && "Conduct technical interviews with zero friction. Candidates model trade-offs and algorithms in real time."}
                  {activeTab === "presentations" && "Present high-resolution architecture diagrams with pan-and-zoom viewports directly to stakeholders."}
                </p>

                <Link
                  href="/signup"
                  className="bg-[#533afd] hover:bg-[#4434d4] text-white text-[14px] font-medium px-5 py-2 rounded-full shadow-stripe-1 inline-flex items-center gap-1.5"
                >
                  <span>Use this workflow</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Technical Structured Graphic */}
              <div className="bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl p-6 min-h-[260px] flex items-center justify-center">
                {activeTab === "architecture" && (
                  <div className="text-center font-sans w-full">
                    <div className="text-xs font-semibold text-[#533afd] mb-3 font-mono">Distributed Topology Map</div>
                    <div className="flex flex-wrap gap-3 items-center justify-center">
                      <div className="p-3 bg-white border border-[#e3e8ee] rounded-lg shadow-stripe-1 text-xs font-mono text-[#0d253d]">Next.js Edge</div>
                      <span className="text-[#64748d]">➔</span>
                      <div className="p-3 bg-white border border-[#533afd]/40 rounded-lg shadow-stripe-1 text-xs font-mono text-[#533afd]">API Gateway</div>
                      <span className="text-[#64748d]">➔</span>
                      <div className="p-3 bg-white border border-[#e3e8ee] rounded-lg shadow-stripe-1 text-xs font-mono text-emerald-700">PostgreSQL DB</div>
                    </div>
                  </div>
                )}
                {activeTab === "wireframe" && (
                  <div className="w-full max-w-sm bg-white border border-[#e3e8ee] rounded-lg p-4 shadow-stripe-1">
                    <div className="h-4 bg-[#f6f9fc] rounded w-1/3 mb-3" />
                    <div className="h-10 bg-[#533afd]/10 border border-[#533afd]/30 rounded mb-2 flex items-center justify-center text-xs font-mono text-[#533afd]">Primary Action Button</div>
                    <div className="h-6 bg-[#f6f9fc] rounded w-2/3" />
                  </div>
                )}
                {activeTab === "brainstorming" && (
                  <div className="grid grid-cols-2 gap-3 text-xs w-full">
                    <div className="p-3 bg-[#f5e9d4] rounded-lg text-[#0d253d] font-mono">Product Roadmap Target</div>
                    <div className="p-3 bg-[#b9b9f9]/30 rounded-lg text-[#0d253d] font-mono">OAuth 2.0 Integration</div>
                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-900 font-mono">Audit Log Review</div>
                    <div className="p-3 bg-rose-50 rounded-lg text-rose-900 font-mono">Latency Optimization</div>
                  </div>
                )}
                {activeTab === "interviews" && (
                  <div className="font-mono text-xs text-[#0d253d] bg-white p-4 rounded-lg border border-[#e3e8ee] w-full shadow-stripe-1">
                    <div className="text-[#533afd] font-bold mb-1">// System Design: URL Shortener</div>
                    <div>1. Hash(url) -&gt; 7 char Base62 token</div>
                    <div>2. Read ratio: 100:1 via Redis Cache</div>
                    <div>3. Active database replication tier</div>
                  </div>
                )}
                {activeTab === "presentations" && (
                  <div className="text-center">
                    <div className="inline-block bg-[#533afd]/10 border border-[#533afd]/30 p-4 rounded-xl text-[16px] font-light text-[#533afd]">
                      Architecture RFC Review: Q3 Roadmap
                    </div>
                    <div className="text-xs text-[#64748d] mt-2 font-mono">Slide 01 of 12 &bull; Interactive Viewport</div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>



      {/* ========================================================================= */}
      {/* 10. FAQ ACCORDION                                                         */}
      {/* ========================================================================= */}
      <section id="faq" className="py-24 bg-white border-b border-[#e3e8ee]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#533afd] bg-[#b9b9f9]/40 px-3 py-1 rounded-full">
              Reference & Details
            </span>
            <h2 className="text-[36px] sm:text-[48px] font-light text-[#0d253d] tracking-display-xl leading-[1.1] mt-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Is Drawscape free for individual developers?",
                a: "Yes. The core Drawscape whiteboard editor is completely free, open-source under MIT, and requires no account or registration."
              },
              {
                q: "How is real-time synchronization secured?",
                a: "When a collaborative session begins, a unique cryptographic key is generated in the browser. All canvas mutations are end-to-end encrypted before transmission through WebSockets."
              },
              {
                q: "Which file formats are supported for export?",
                a: "You can export directly to PNG, SVG with embedded scene data, and JSON. You can also export structured Mermaid and PlantUML definition files."
              },
              {
                q: "How does the Natural Language Diagram Engine function?",
                a: "The engine transforms natural language specifications into valid Drawscape graph element trees (shapes, directional connectors, labels, and hierarchy coordinates)."
              },
              {
                q: "Can Drawscape be embedded into custom web applications?",
                a: "Yes. Drawscape can be embedded directly into React and Next.js applications using the official package wrapper."
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden shadow-stripe-1 transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left font-medium text-[16px] text-[#0d253d] flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{item.q}</span>
                  <span className="text-[#533afd] font-mono text-xl">{faqOpen === idx ? "−" : "+"}</span>
                </button>
                {faqOpen === idx && (
                  <div className="px-5 pb-5 text-[14px] text-[#64748d] font-light border-t border-[#e3e8ee] pt-3 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. BOTTOM ATMOSPHERIC CTA BANNER (Nocturnal Celestial Masterpiece)       */}
      {/* ========================================================================= */}
      <section className="relative py-28 sm:py-36 bg-[#040812] text-white overflow-hidden isolate border-t border-white/10">
        
        {/* Background Image: Nocturnal Celestial Variation generated from Hero artwork */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: `url('/cta-bg.jpg')` }}
        />

        {/* Shady Atmospheric Moody Vignette & Depth Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#040812]/75 via-[#040812]/35 to-[#040812]/85 pointer-events-none" />
        <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.85)] pointer-events-none" />

        {/* Top Edge Glowing Beam */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#533afd]/80 via-amber-300/40 to-transparent pointer-events-none" />

        {/* Subtle Film Grain Noise Texture */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-25"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        {/* Central Soft Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#533afd]/20 rounded-full blur-[140px] pointer-events-none" />

        {/* Foreground Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

          <h2 className="text-[38px] sm:text-[54px] lg:text-[62px] font-light tracking-display-xxl leading-[1.08] mb-6 text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
            Ready to structure your system architecture?
          </h2>
          
          <p className="max-w-xl mx-auto text-[16px] sm:text-[18px] text-white/85 font-light mb-10 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Join engineers, software architects, and tech leaders building on Drawscape every day.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-[#533afd] hover:bg-[#4434d4] text-white text-[15px] font-medium px-9 py-3.5 rounded-full shadow-[0_0_35px_rgba(83,58,253,0.5)] border border-white/25 hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <span>Start Drawing Now (Free)</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. SITE FOOTER ({footer-light})                                          */}
      {/* ========================================================================= */}
      <footer className="bg-white text-[#64748d] py-16 border-t border-[#e3e8ee] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            {/* Brand Col */}
            <div className="col-span-2">
              <div className="mb-4">
                <Logo size="sm" />
              </div>
              <p className="text-[#64748d] text-[13px] leading-relaxed max-w-sm mb-4 font-light">
                Collaborative diagramming and architectural whiteboard software. Built with modern engineering principles and open standards.
              </p>
              <p className="text-[11px] text-[#64748d] font-mono">
                © {new Date().getFullYear()} Drawscape. All rights reserved.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#0d253d] mb-4 font-mono">Product</h4>
              <ul className="space-y-2 text-[13px] text-[#64748d]">
                <li><a href="#features" className="hover:text-[#0d253d] transition-colors">Features</a></li>
                <li><a href="#ai-engine" className="hover:text-[#0d253d] transition-colors">AI Engine</a></li>
                <li><a href="#use-cases" className="hover:text-[#0d253d] transition-colors">Workflows</a></li>
                <li><a href="#faq" className="hover:text-[#0d253d] transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#0d253d] mb-4 font-mono">Resources</h4>
              <ul className="space-y-2 text-[13px] text-[#64748d]">
                <li><a href="#" className="hover:text-[#0d253d] transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-[#0d253d] transition-colors">Component Libraries</a></li>
                <li><a href="#" className="hover:text-[#0d253d] transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-[#0d253d] transition-colors">GitHub Repository</a></li>
              </ul>
            </div>

            {/* Security & Legal */}
            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#0d253d] mb-4 font-mono">Security & Trust</h4>
              <ul className="space-y-2 text-[13px] text-[#64748d]">
                <li><Link href="/privacy" className="hover:text-[#0d253d] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[#0d253d] transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-[#0d253d] transition-colors">End-to-End Encryption</a></li>
                <li><a href="#" className="hover:text-[#0d253d] transition-colors">Security Architecture</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-[#e3e8ee] flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#64748d] gap-4">
            <div>
              Engineered for visual thinkers and modern technical teams.
            </div>
            <div className="font-mono text-[#64748d]">
              Open source under MIT License
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

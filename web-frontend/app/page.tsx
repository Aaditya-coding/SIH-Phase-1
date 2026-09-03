"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Search,
  Database,
  Globe,
  CheckCircle2,
  Lock,
  Cpu,
  Sparkles,
  Layers,
  FileCheck
} from "lucide-react";

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live interactive bioluminescent particles floating across the Deep Navy background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Generate 45 deep-sea bioluminescent floating organisms/spores
    const colors = ["#00F0FF", "#818CF8", "#A78BFA", "#38BDF8", "#C084FC"];
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(Math.random() * 0.45 + 0.15), // Gentle upward drift
      alpha: Math.random() * 0.6 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.phase += 0.02;
        p.x += p.vx + Math.sin(p.phase) * 0.25;
        p.y += p.vy;

        // Wrap around screen
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const pulseAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.phase));

        // Soft outer luminescent glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = pulseAlpha * 0.25;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fill();

        // Inner sharp particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = pulseAlpha;
        ctx.shadowBlur = 4;
        ctx.shadowColor = p.color;
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#101018] text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden font-sans">
      
      {/* ========================================================= */}
      {/* LIVE DEEP NAVY BACKGROUND (Moving Video + Live Particles) */}
      {/* ========================================================= */}
      <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
        
        {/* Live Moving Jellyfish Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center opacity-45 scale-105 filter brightness-105 contrast-125 transition-opacity duration-1000"
        >
          <source src="/jellyfish.webm" type="video/webm" />
          <source src="https://upload.wikimedia.org/wikipedia/commons/4/49/Spotted_jelly_(Mastigias_papua)_in_Vancouver.webm" type="video/webm" />
        </video>

        {/* Deep Navy Color-Grading Overlay (#1C1C28 & #101018) */}
        <div className="absolute inset-0 bg-[#101018]/50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101018] via-[#1C1C28]/60 to-[#101018]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#101018]/60 to-[#101018]" />

        {/* Dynamic Bioluminescent Spores Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Ambient Jellyfish Glow Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 right-10 w-[500px] h-[350px] bg-blue-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-[600px] h-[350px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />
      </div>

      {/* ========================================================= */}
      {/* NAVIGATION BAR (Deep Navy #1C1C28 Frosted Glass)         */}
      {/* ========================================================= */}
      <nav className="relative z-20 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-[#2D2D3F]/80 backdrop-blur-md bg-[#1C1C28]/70">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white block leading-tight">
              Truth Intelligence
            </span>
            <span className="text-[10px] font-mono text-indigo-300 tracking-wider uppercase block">
              Automated Forensic Engine
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Forensic Capabilities</a>
          <a href="#pipeline" className="hover:text-white transition-colors">OSINT Pipeline</a>
          <a href="#telemetry" className="hover:text-white transition-colors">Diffusion Telemetry</a>
          <Link href="/dashboard" className="text-indigo-300 hover:text-white transition-colors flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Live Node</span>
          </Link>
        </div>

        {/* Auth & CTA Actions */}
        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white hover:bg-[#252538]">
                Log in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" className="text-xs font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white shadow-md shadow-indigo-500/25 border-0">
                Get Started
              </Button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            <UserButton />
            <Link href="/dashboard">
              <Button size="sm" className="text-xs font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 border-0">
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </Show>
        </div>
      </nav>

      {/* ========================================================= */}
      {/* HERO SECTION                                              */}
      {/* ========================================================= */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-16 pb-20 max-w-5xl mx-auto w-full">
        
        {/* Hackathon / Tech Pill (Deep Navy #1C1C28) */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#2D2D3F] bg-[#1C1C28]/90 text-indigo-300 text-xs font-mono font-medium shadow-[0_0_20px_rgba(28,28,40,0.8)] mb-8 animate-fadeIn backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Smart India Hackathon • Real-Time Narrative Telemetry</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] max-w-4xl mb-6">
          Automated{" "}
          <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
            Fake News Detection
          </span>{" "}
          &amp; Diffusion Forensics
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl leading-relaxed mb-10 font-normal">
          A full-stack misinformation intelligence engine. Ingest claims via text or OCR, cross-verify against live OSINT registries via dual-threshold RAG, and model epidemiological narrative velocity in real time.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link href="/dashboard">
            <Button size="lg" className="h-13 px-8 text-sm sm:text-base font-bold bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white shadow-xl shadow-indigo-600/30 rounded-xl flex items-center gap-2 border-0">
              <span>Enter Intelligence Node</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Show when="signed-out">
            <SignUpButton mode="modal">
              <Button variant="outline" size="lg" className="h-13 px-7 text-sm sm:text-base font-semibold border-[#2D2D3F] bg-[#1C1C28]/90 hover:bg-[#262638] text-slate-200 rounded-xl backdrop-blur-md">
                Create Free Account
              </Button>
            </SignUpButton>
          </Show>
        </div>

        {/* Live Metrics Row (Deep Navy #1C1C28 Card) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl p-4 sm:p-6 bg-[#1C1C28]/90 border border-[#2D2D3F] rounded-2xl backdrop-blur-md shadow-2xl">
          <div className="p-3 text-center">
            <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">&lt; 1.8s</div>
            <div className="text-xs text-slate-400 mt-1">Telemetry Latency</div>
          </div>
          <div className="p-3 text-center border-l border-[#2D2D3F]">
            <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-400">3-Tier</div>
            <div className="text-xs text-slate-400 mt-1">OSINT Registries</div>
          </div>
          <div className="p-3 text-center border-l border-[#2D2D3F]">
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">12-Point</div>
            <div className="text-xs text-slate-400 mt-1">Diffusion Curve</div>
          </div>
          <div className="p-3 text-center border-l border-[#2D2D3F]">
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">100%</div>
            <div className="text-xs text-slate-400 mt-1">Autonomous Flow</div>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* CAPABILITIES SECTION (Deep Navy #1C1C28 Cards)            */}
      {/* ========================================================= */}
      <section id="features" className="relative z-10 py-20 px-6 max-w-7xl mx-auto w-full border-t border-[#2D2D3F]/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Comprehensive Verification Pipeline
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3">
            Engineered to analyze volatile disinformation before it triggers systemic social panic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-[#1C1C28]/90 border border-[#2D2D3F] hover:border-indigo-500/50 transition-all group shadow-xl backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multimodal OCR Extraction</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Accepts raw textual claims, viral social media posts, and visual screenshot uploads with integrated Tesseract OCR parsing.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-[#1C1C28]/90 border border-[#2D2D3F] hover:border-blue-500/50 transition-all group shadow-xl backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Dual-Threshold OSINT RAG</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Queries Wikipedia API, Brave Search Engine, and mainstream FactCheck registries to assemble rigorous cryptographic dossiers.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-[#1C1C28]/90 border border-[#2D2D3F] hover:border-purple-500/50 transition-all group shadow-xl backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Diffusion Velocity Modeling</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maps continuous velocity spline curves, calculates virality index scores, and isolates origin versus amplification vectors.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* BOTTOM CTA BANNER (Deep Navy Gradient #1C1C28)             */}
      {/* ========================================================= */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto w-full">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#1C1C28] via-[#242438] to-[#1C1C28] border border-[#2D2D3F] text-center shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Ready to verify breaking claims in real-time?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto">
              Launch the full Threat Intelligence &amp; Narrative Analytics terminal to submit claims, view verified OSINT evidence, and explore the diffusion velocity curve.
            </p>
            <div className="mt-6">
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-8 font-bold bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 shadow-lg shadow-cyan-500/25 rounded-xl border-0">
                  Launch Threat Intelligence Dashboard →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FOOTER                                                    */}
      {/* ========================================================= */}
      <footer className="relative z-10 w-full border-t border-[#2D2D3F]/80 py-8 px-6 text-center text-xs font-mono text-slate-400 bg-[#101018]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>Truth Intelligence Engine • Deep Navy Edition (#1C1C28)</div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-slate-400 hover:text-cyan-400 transition-colors">
              Dashboard
            </Link>
            <a href="https://github.com/Aaditya-coding/SIH-Phase-1" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
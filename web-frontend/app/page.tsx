"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ThreeUIBadge, ThreeUIProfileButton } from "@/components/ui/threeui-badge";
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
  FileCheck,
  Network,
  Terminal,
  Server,
  ExternalLink,
  RefreshCw,
  GitBranch,
  Boxes,
  FileText,
  History
} from "lucide-react";

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // =========================================================
  // THEME 2: NEURAL THREAT GRAPH & CONSTELLATION NETWORK
  // =========================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: width / 2,
      y: height / 2,
      isHovering: false,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isHovering = true;
    };

    const handleMouseLeave = () => {
      mouse.isHovering = false;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    // Node array
    interface NodePoint {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      pulsePhase: number;
    }

    let nodes: NodePoint[] = [];

    const initNodes = () => {
      nodes = [];
      const count = Math.min(Math.floor(width / 15), 85);
      const palette = ["#00F0FF", "#818CF8", "#A78BFA", "#38BDF8", "#C084FC"];

      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.65,
          vy: (Math.random() - 0.5) * 0.65,
          radius: Math.random() * 2.2 + 1.2,
          color: palette[Math.floor(Math.random() * palette.length)],
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    initNodes();

    const maxDistance = 125;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep Navy background radial glow
      const radial = ctx.createRadialGradient(
        width / 2,
        height / 2,
        80,
        width / 2,
        height / 2,
        width * 0.75
      );
      radial.addColorStop(0, "rgba(28, 28, 40, 0.45)");
      radial.addColorStop(1, "rgba(16, 16, 24, 0.85)");
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        a.pulsePhase += 0.025;

        // Bounce off screen boundaries
        if (a.x < 0 || a.x > width) a.vx *= -1;
        if (a.y < 0 || a.y > height) a.vy *= -1;

        // Interactive mouse magnetic link and gentle repulsion
        if (mouse.isHovering) {
          const dxm = mouse.x - a.x;
          const dym = mouse.y - a.y;
          const distMouse = Math.sqrt(dxm * dxm + dym * dym);
          if (distMouse < 140) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${1 - distMouse / 140})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Gentle push
            a.x -= (dxm / distMouse) * 0.4;
            a.y -= (dym / distMouse) * 0.4;
          }
        }

        // Draw connections between nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = 1 - dist / maxDistance;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha * 0.35})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Draw glowing node
        const pulsingRadius = a.radius + Math.sin(a.pulsePhase) * 0.5;
        ctx.beginPath();
        ctx.arc(a.x, a.y, pulsingRadius, 0, Math.PI * 2);
        ctx.fillStyle = a.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = a.color;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#101018] text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden font-sans no-scrollbar">
      
      {/* ========================================================= */}
      {/* LIVE NEURAL THREAT GRAPH BACKGROUND CANVAS                */}
      {/* ========================================================= */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        
        {/* Deep Navy Overlays & Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101018] via-[#1C1C28]/40 to-[#101018]/90 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#101018]/60 to-[#101018] pointer-events-none" />
        
        {/* Soft Ambient Radial Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[350px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-[600px] h-[350px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />
      </div>

      {/* ========================================================= */}
      {/* FLOATING CURVED NAVIGATION BAR                            */}
      {/* ========================================================= */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <nav className="w-full px-5 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between rounded-2xl sm:rounded-full border border-[#2D2D3F] backdrop-blur-xl bg-[#1C1C28]/85 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <ThreeUIBadge size="sm" />
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-white block leading-tight">
                Truth Intelligence
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono text-cyan-400 tracking-wider uppercase block">
                SIH Phase 1 • Forensic Engine
              </span>
            </div>
          </Link>

          {/* Center Nav Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Core Capabilities</a>
            <a href="#pipeline" className="hover:text-white transition-colors">Architecture Pipeline</a>
            <a href="#tech-stack" className="hover:text-white transition-colors">Tech Stack</a>
            <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>Launch Dashboard</span>
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
              <ThreeUIProfileButton>
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="Verification History"
                      labelIcon={<History className="w-4 h-4 text-cyan-400" />}
                      href="/history"
                    />
                  </UserButton.MenuItems>
                </UserButton>
              </ThreeUIProfileButton>
              <Link href="/dashboard">
                <Button size="sm" className="text-xs font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 border-0 rounded-full px-3.5">
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </Show>
          </div>
        </nav>
      </div>

      {/* ========================================================= */}
      {/* HERO SECTION                                              */}
      {/* ========================================================= */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-16 pb-20 max-w-5xl mx-auto w-full">
        
        {/* Hackathon Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#2D2D3F] bg-[#1C1C28]/90 text-indigo-300 text-xs font-mono font-medium shadow-[0_0_20px_rgba(28,28,40,0.8)] mb-8 animate-fadeIn backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Smart India Hackathon • Dual-Threshold RAG &amp; Vector Pipeline</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] max-w-4xl mb-6">
          Automated{" "}
          <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
            Fake News Detection
          </span>{" "}
          &amp; Explainable Verification
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl leading-relaxed mb-6 font-normal">
          A full-stack, AI-powered misinformation detection and fact-verification system designed to extract claims from text and screenshots, retrieve web evidence, and model real-time narrative diffusion.
        </p>

        {/* Core Equation Banner from README */}
        <div className="w-full max-w-3xl p-3.5 px-5 bg-[#141420]/90 border border-[#2D2D3F] rounded-xl text-xs font-mono text-cyan-300 shadow-lg mb-10 flex flex-wrap items-center justify-center gap-2 backdrop-blur-md">
          <span className="text-slate-300">Claim</span>
          <span className="text-indigo-400">+</span>
          <span className="text-slate-300">Web Evidence</span>
          <span className="text-indigo-400">+</span>
          <span className="text-slate-300">Semantic RAG</span>
          <span className="text-indigo-400">+</span>
          <span className="text-slate-300">Neo4j Graph</span>
          <span className="text-indigo-400">+</span>
          <span className="text-slate-300">AI Reasoning</span>
          <span className="text-cyan-400 font-bold">=</span>
          <span className="text-emerald-400 font-bold">Explainable Verification</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link href="/dashboard">
            <Button size="lg" className="h-13 px-8 text-sm sm:text-base font-bold bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white shadow-xl shadow-indigo-600/30 rounded-xl flex items-center gap-2 border-0">
              <span>Enter Threat Intelligence Node</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <a
            href="https://github.com/Aaditya-coding/SIH-Phase-1"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 h-13 px-7 text-sm sm:text-base font-semibold border border-[#2D2D3F] bg-[#1C1C28]/90 hover:bg-[#262638] text-slate-200 rounded-xl backdrop-blur-md transition-all"
          >
            <GitBranch className="w-4 h-4 text-indigo-400" />
            <span>GitHub Repository</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>

        {/* Live Metrics Row (Deep Navy #1C1C28 Card) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl p-4 sm:p-6 bg-[#1C1C28]/90 border border-[#2D2D3F] rounded-2xl backdrop-blur-md shadow-2xl">
          <div className="p-3 text-center">
            <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">&lt; 1.8s</div>
            <div className="text-xs text-slate-400 mt-1">Telemetry Latency</div>
          </div>
          <div className="p-3 text-center border-l border-[#2D2D3F]">
            <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-400">Dual-DB</div>
            <div className="text-xs text-slate-400 mt-1">Qdrant + Neo4j</div>
          </div>
          <div className="p-3 text-center border-l border-[#2D2D3F]">
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">OCR &amp; NLP</div>
            <div className="text-xs text-slate-400 mt-1">Multimodal Tesseract</div>
          </div>
          <div className="p-3 text-center border-l border-[#2D2D3F]">
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">100%</div>
            <div className="text-xs text-slate-400 mt-1">Explainable Reasoning</div>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* SECTION 2: END-TO-END VERIFICATION PIPELINE (FROM README) */}
      {/* ========================================================= */}
      <section id="pipeline" className="relative z-10 py-20 px-6 max-w-7xl mx-auto w-full border-t border-[#2D2D3F]/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-2">
            System Architecture &amp; Workflow
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            How Truth Intelligence Verifies Claims
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3">
            A distributed asynchronous architecture running on FastAPI, Celery, Redis, and specialized vector &amp; graph databases.
          </p>
        </div>

        {/* 6-Step Pipeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-[#1C1C28]/90 border border-[#2D2D3F] hover:border-cyan-500/50 transition-all backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-4 right-4 text-xs font-mono text-slate-500 font-bold">01</div>
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Multimodal Input Ingestion</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Accepts breaking textual statements or image screenshots. Automatically runs Tesseract OCR in the <code className="text-cyan-400 font-mono">multimodal/</code> module to extract raw claim text.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-[#1C1C28]/90 border border-[#2D2D3F] hover:border-indigo-500/50 transition-all backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-4 right-4 text-xs font-mono text-slate-500 font-bold">02</div>
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Claim Extraction &amp; NLP</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deconstructs verbose headlines into atomic factual assertions using spaCy Named Entity Recognition (NER), claim normalization, and multi-lingual translation preprocessing.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-[#1C1C28]/90 border border-[#2D2D3F] hover:border-purple-500/50 transition-all backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-4 right-4 text-xs font-mono text-slate-500 font-bold">03</div>
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Async Celery &amp; Redis Queue</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              FastAPI offloads heavy computational verification tasks to Celery worker pools with Redis message brokers, guaranteeing non-blocking responses and live progress polling.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-[#1C1C28]/90 border border-[#2D2D3F] hover:border-blue-500/50 transition-all backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-4 right-4 text-xs font-mono text-slate-500 font-bold">04</div>
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Qdrant Vector Search</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transforms claims into high-dimensional semantic embeddings with Sentence Transformers, executing sub-second similarity searches over verified claim databases.
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-6 rounded-2xl bg-[#1C1C28]/90 border border-[#2D2D3F] hover:border-emerald-500/50 transition-all backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-4 right-4 text-xs font-mono text-slate-500 font-bold">05</div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Neo4j Knowledge Graph</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maintains relational graph topologies across entities, narratives, and evidence rather than flat text, discovering cross-claim contradictions and origin vectors.
            </p>
          </div>

          {/* Step 6 */}
          <div className="p-6 rounded-2xl bg-[#1C1C28]/90 border border-[#2D2D3F] hover:border-amber-500/50 transition-all backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-4 right-4 text-xs font-mono text-slate-500 font-bold">06</div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Explainable AI Verdict &amp; Telemetry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates a categorical verdict (Supported, Refuted, Misleading), confidence percentage, comprehensive LLM rationale, and an epidemiological 12-point diffusion curve.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: KEY HIGHLIGHTS & DIFFERENTIATORS               */}
      {/* ========================================================= */}
      <section id="features" className="relative z-10 py-20 px-6 max-w-7xl mx-auto w-full border-t border-[#2D2D3F]/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-2">
            Why Truth Intelligence
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Moving Beyond Binary "Fake" or "Real" Flags
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3">
            Traditional detectors output unverified binary classifications. Truth Intelligence supplies transparent, auditable evidence with cryptographic source attribution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-[#1C1C28]/90 border border-[#2D2D3F] backdrop-blur-md">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Live Web Search &amp; RAG Ranking</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Queries real-time web registries (DuckDuckGo, Brave Search, Wikipedia API) and scores source authority to isolate verified fact-checking articles.
            </p>
            <span className="text-[11px] font-mono text-cyan-300">Implemented in retrieval/</span>
          </div>

          <div className="p-6 rounded-2xl bg-[#1C1C28]/90 border border-[#2D2D3F] backdrop-blur-md">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Real-Time Lexical Diffusion Telemetry</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Models the viral propagation velocity of breaking statements. Estimates peak hype hour, viral spike speed, and cooldown intervals to forecast spread.
            </p>
            <span className="text-[11px] font-mono text-indigo-300">Continuous Spline Curve</span>
          </div>

          <div className="p-6 rounded-2xl bg-[#1C1C28]/90 border border-[#2D2D3F] backdrop-blur-md">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Automated Benchmarking &amp; Evaluation</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Features an automated evaluation framework in <code className="text-purple-300 font-mono">evaluation/</code> for benchmarking verification accuracy against predefined test suites.
            </p>
            <span className="text-[11px] font-mono text-purple-300">scikit-learn &amp; test suites</span>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: COMPLETE TECHNOLOGY STACK (FROM README)        */}
      {/* ========================================================= */}
      <section id="tech-stack" className="relative z-10 py-20 px-6 max-w-7xl mx-auto w-full border-t border-[#2D2D3F]/80">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-2">
            Built with Modern Engineering
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Production Technology Stack
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Every layer of the Truth Intelligence stack is optimized for high-throughput, low-latency disinformation forensics.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 max-w-5xl mx-auto">
          
          <div className="p-4 rounded-xl bg-[#1C1C28]/90 border border-[#2D2D3F] text-center backdrop-blur-md hover:border-indigo-500/40 transition-all">
            <div className="text-indigo-400 font-bold text-sm mb-1">FastAPI</div>
            <div className="text-[11px] text-slate-400">REST API Backend</div>
          </div>

          <div className="p-4 rounded-xl bg-[#1C1C28]/90 border border-[#2D2D3F] text-center backdrop-blur-md hover:border-cyan-500/40 transition-all">
            <div className="text-cyan-400 font-bold text-sm mb-1">Next.js / React</div>
            <div className="text-[11px] text-slate-400">Web Frontend</div>
          </div>

          <div className="p-4 rounded-xl bg-[#1C1C28]/90 border border-[#2D2D3F] text-center backdrop-blur-md hover:border-purple-500/40 transition-all">
            <div className="text-purple-400 font-bold text-sm mb-1">Celery + Redis</div>
            <div className="text-[11px] text-slate-400">Async Task Queue</div>
          </div>

          <div className="p-4 rounded-xl bg-[#1C1C28]/90 border border-[#2D2D3F] text-center backdrop-blur-md hover:border-blue-500/40 transition-all">
            <div className="text-blue-400 font-bold text-sm mb-1">Qdrant</div>
            <div className="text-[11px] text-slate-400">Vector Search DB</div>
          </div>

          <div className="p-4 rounded-xl bg-[#1C1C28]/90 border border-[#2D2D3F] text-center backdrop-blur-md hover:border-emerald-500/40 transition-all">
            <div className="text-emerald-400 font-bold text-sm mb-1">Neo4j</div>
            <div className="text-[11px] text-slate-400">Graph Database</div>
          </div>

          <div className="p-4 rounded-xl bg-[#1C1C28]/90 border border-[#2D2D3F] text-center backdrop-blur-md hover:border-amber-500/40 transition-all">
            <div className="text-amber-400 font-bold text-sm mb-1">Tesseract OCR</div>
            <div className="text-[11px] text-slate-400">Multimodal Reader</div>
          </div>

          <div className="p-4 rounded-xl bg-[#1C1C28]/90 border border-[#2D2D3F] text-center backdrop-blur-md hover:border-indigo-500/40 transition-all">
            <div className="text-indigo-400 font-bold text-sm mb-1">OpenAI / LLMs</div>
            <div className="text-[11px] text-slate-400">AI Verification</div>
          </div>

          <div className="p-4 rounded-xl bg-[#1C1C28]/90 border border-[#2D2D3F] text-center backdrop-blur-md hover:border-cyan-500/40 transition-all">
            <div className="text-cyan-400 font-bold text-sm mb-1">Transformers</div>
            <div className="text-[11px] text-slate-400">Sentence Embeddings</div>
          </div>

          <div className="p-4 rounded-xl bg-[#1C1C28]/90 border border-[#2D2D3F] text-center backdrop-blur-md hover:border-purple-500/40 transition-all">
            <div className="text-purple-400 font-bold text-sm mb-1">spaCy</div>
            <div className="text-[11px] text-slate-400">NER &amp; Normalization</div>
          </div>

          <div className="p-4 rounded-xl bg-[#1C1C28]/90 border border-[#2D2D3F] text-center backdrop-blur-md hover:border-blue-500/40 transition-all">
            <div className="text-blue-400 font-bold text-sm mb-1">DDGS Search</div>
            <div className="text-[11px] text-slate-400">Live OSINT Scraping</div>
          </div>

          <div className="p-4 rounded-xl bg-[#1C1C28]/90 border border-[#2D2D3F] text-center backdrop-blur-md hover:border-emerald-500/40 transition-all">
            <div className="text-emerald-400 font-bold text-sm mb-1">Docker</div>
            <div className="text-[11px] text-slate-400">Multi-Service Compose</div>
          </div>

          <div className="p-4 rounded-xl bg-[#1C1C28]/90 border border-[#2D2D3F] text-center backdrop-blur-md hover:border-amber-500/40 transition-all">
            <div className="text-amber-400 font-bold text-sm mb-1">Streamlit</div>
            <div className="text-[11px] text-slate-400">Python Testing UI</div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: BOTTOM CTA BANNER                              */}
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
            <div className="mt-6 flex items-center justify-center">
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
          <div>Truth Intelligence Engine • Smart India Hackathon Phase 1</div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Aaditya-coding/SIH-Phase-1"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
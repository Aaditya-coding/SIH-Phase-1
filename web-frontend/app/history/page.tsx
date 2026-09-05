"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  getUserHistory,
  deleteHistoryItem,
  clearUserHistory,
  VerificationHistoryItem
} from "@/lib/history";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThreeUIBadge, ThreeUIProfileButton } from "@/components/ui/threeui-badge";
import {
  ShieldCheck,
  Zap,
  Activity,
  Search,
  Trash2,
  ExternalLink,
  ArrowLeft,
  Home,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  History,
  ChevronDown,
  ChevronUp,
  Flame,
  FileText
} from "lucide-react";

export default function HistoryPage() {
  const { user, isLoaded } = useUser();
  const [historyItems, setHistoryItems] = useState<VerificationHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVerdict, setFilterVerdict] = useState<string>("ALL");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load user history once Clerk auth is ready
  useEffect(() => {
    if (isLoaded) {
      const items = getUserHistory(user?.id || user?.primaryEmailAddress?.emailAddress);
      setHistoryItems(items);
    }
  }, [isLoaded, user]);

  // Live Neural Threat Graph background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };
    window.addEventListener("resize", handleResize);

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
      const count = Math.min(Math.floor(width / 18), 75);
      const palette = ["#00F0FF", "#818CF8", "#A78BFA", "#38BDF8", "#C084FC"];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          color: palette[Math.floor(Math.random() * palette.length)],
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    initNodes();
    const maxDistance = 120;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const radial = ctx.createRadialGradient(
        width / 2,
        height / 2,
        80,
        width / 2,
        height / 2,
        width * 0.75
      );
      radial.addColorStop(0, "rgba(28, 28, 40, 0.4)");
      radial.addColorStop(1, "rgba(16, 16, 24, 0.85)");
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        a.pulsePhase += 0.02;

        if (a.x < 0 || a.x > width) a.vx *= -1;
        if (a.y < 0 || a.y > height) a.vy *= -1;

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
            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha * 0.3})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        const pulsingRadius = a.radius + Math.sin(a.pulsePhase) * 0.4;
        ctx.beginPath();
        ctx.arc(a.x, a.y, pulsingRadius, 0, Math.PI * 2);
        ctx.fillStyle = a.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = a.color;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Delete single item
  const handleDelete = (id: string) => {
    deleteHistoryItem(user?.id || user?.primaryEmailAddress?.emailAddress, id);
    setHistoryItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear all items for this user
  const handleClearAll = () => {
    clearUserHistory(user?.id || user?.primaryEmailAddress?.emailAddress);
    setHistoryItems([]);
    setShowClearConfirm(false);
  };

  // Toggle card explanation expansion
  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return historyItems.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.reason && item.reason.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesVerdict =
        filterVerdict === "ALL" ||
        item.verdict.toUpperCase() === filterVerdict.toUpperCase();

      return matchesSearch && matchesVerdict;
    });
  }, [historyItems, searchQuery, filterVerdict]);

  // Aggregate statistics
  const stats = useMemo(() => {
    const total = historyItems.length;
    if (total === 0) return { total: 0, highVirality: 0, refuted: 0, avgConfidence: 0 };

    const highVirality = historyItems.filter((i) => i.virality_index >= 70).length;
    const refuted = historyItems.filter((i) =>
      ["REFUTED", "FABRICATED", "MISLEADING"].includes(i.verdict.toUpperCase())
    ).length;
    const avgConfidence = Math.round(
      historyItems.reduce((acc, curr) => acc + (curr.confidence || 0), 0) / total
    );

    return { total, highVirality, refuted, avgConfidence };
  }, [historyItems]);

  const getVerdictBadge = (verdict: string) => {
    const v = verdict?.toUpperCase();
    switch (v) {
      case "SUPPORTED":
        return {
          label: "SUPPORTED",
          classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case "REFUTED":
      case "FABRICATED":
        return {
          label: "REFUTED",
          classes: "bg-rose-500/15 text-rose-400 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.25)]",
          icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
        };
      case "MISLEADING":
      case "RECONTEXTUALIZED":
        return {
          label: "MISLEADING",
          classes: "bg-amber-500/15 text-amber-400 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        };
      default:
        return {
          label: verdict || "UNVERIFIED",
          classes: "bg-slate-500/15 text-slate-300 border-slate-500/50",
          icon: <HelpCircle className="w-3.5 h-3.5 text-slate-400" />,
        };
    }
  };

  const getViralityColor = (score: number) => {
    if (score >= 75) return "text-rose-400 bg-rose-500/15 border-rose-500/40";
    if (score >= 50) return "text-amber-400 bg-amber-500/15 border-amber-500/40";
    return "text-cyan-400 bg-cyan-500/15 border-cyan-500/40";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#101018] text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden font-sans no-scrollbar">
      
      {/* Background Neural Canvas */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101018] via-[#1C1C28]/40 to-[#101018]/90 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#101018]/60 to-[#101018] pointer-events-none" />
      </div>

      {/* Header Bar */}
      <header className="relative z-20 w-full border-b border-[#2D2D3F]/80 backdrop-blur-md bg-[#1C1C28]/80 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Breadcrumb */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <ThreeUIBadge size="md" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white leading-tight">
                  Verification History
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  Account Archive
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {user?.primaryEmailAddress?.emailAddress ? (
                  <span>Logged in as <strong className="text-slate-200">{user.primaryEmailAddress.emailAddress}</strong></span>
                ) : (
                  "Autonomous Disinformation Forensics"
                )}
              </p>
            </div>
          </div>

          {/* Nav Links & Clerk User Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-[#141420] hover:bg-[#202030] border border-[#2D2D3F] rounded-full transition-all shadow-sm"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Back to Dashboard</span>
            </Link>

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
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        
        {/* Statistics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          
          <div className="p-4 rounded-2xl bg-[#1C1C28]/90 border border-[#2D2D3F] backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Checked</span>
              <History className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
              {stats.total}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Saved to your account</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1C1C28]/90 border border-[#2D2D3F] backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">High Virality Claims</span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400 mt-1">
              {stats.highVirality}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Virality Index &ge; 70</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1C1C28]/90 border border-[#2D2D3F] backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Refuted / Misleading</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400 mt-1">
              {stats.refuted}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Debunked narratives</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1C1C28]/90 border border-[#2D2D3F] backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Avg Confidence</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-1">
              {stats.avgConfidence}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Empirical certainty</div>
          </div>

        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 p-4 rounded-2xl bg-[#1C1C28]/90 border border-[#2D2D3F] backdrop-blur-md">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search claims or keywords in history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#141420] border-[#2D2D3F] text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 rounded-xl focus:border-cyan-500"
            />
          </div>

          {/* Verdict Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#141420] p-1.5 rounded-xl border border-[#2D2D3F]">
            {["ALL", "SUPPORTED", "REFUTED", "MISLEADING"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterVerdict(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterVerdict === tab
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab === "ALL" ? "All Claims" : tab}
              </button>
            ))}
          </div>

          {/* Clear All Action */}
          {historyItems.length > 0 && (
            <div className="relative">
              {showClearConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-medium">Wipe history?</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleClearAll}
                    className="text-xs h-8 px-2.5 bg-rose-600 hover:bg-rose-500"
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowClearConfirm(false)}
                    className="text-xs h-8 px-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5 h-8 border border-transparent hover:border-rose-500/30 rounded-xl"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Archive</span>
                </Button>
              )}
            </div>
          )}

        </div>

        {/* History Cards List */}
        {filteredItems.length === 0 ? (
          /* Empty State */
          <div className="p-12 rounded-3xl bg-[#1C1C28]/90 border border-[#2D2D3F] text-center backdrop-blur-md shadow-2xl max-w-2xl mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-4 shadow-lg">
              <History className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {historyItems.length === 0
                ? "No Verification History Yet"
                : "No Matching Claims Found"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              {historyItems.length === 0
                ? "Whenever you analyze news or claims in the Threat Intelligence Dashboard, your results (verdict, virality index, and confidence score) will automatically be saved to your account here."
                : "Try adjusting your search query or verdict filter tabs above to find what you're looking for."}
            </p>
            {historyItems.length === 0 && (
              <Link href="/dashboard">
                <Button className="h-10 px-6 font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white rounded-xl shadow-lg shadow-indigo-500/25 border-0">
                  Analyze Your First Claim →
                </Button>
              </Link>
            )}
          </div>
        ) : (
          /* List of History Cards */
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map((item) => {
              const badge = getVerdictBadge(item.verdict);
              const isExpanded = !!expandedCards[item.id];

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[#1C1C28]/90 border border-[#2D2D3F] hover:border-indigo-500/40 transition-all backdrop-blur-md shadow-xl relative group"
                >
                  
                  {/* Top Bar: Verdict Badge, Virality Index, Confidence Score, Timestamp */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-[#2D2D3F]/60">
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Verdict Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${badge.classes}`}>
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>

                      {/* Confidence Score Pill */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#141420] text-indigo-300 border border-[#2D2D3F]">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{item.confidence}% Confidence</span>
                      </span>

                      {/* Virality Index Pill */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${getViralityColor(item.virality_index)}`}>
                        <Zap className="w-3.5 h-3.5" />
                        <span>{item.virality_index}/100 Virality Index</span>
                      </span>

                      {/* OSINT Sources Count */}
                      {item.evidence_count > 0 && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono text-slate-400 bg-[#141420] border border-[#2D2D3F]">
                          <span>{item.evidence_count} Sources</span>
                        </span>
                      )}

                      {/* Check Frequency Counter Badge */}
                      {item.check_count && item.check_count > 1 && (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                          title={`Verified ${item.check_count} times`}
                        >
                          <RefreshCw className="w-3 h-3 text-cyan-400" />
                          <span>Checked {item.check_count}x</span>
                        </span>
                      )}
                    </div>

                    {/* Timestamp & Actions */}
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-400">
                        {item.timestamp}
                      </span>

                      {/* Re-verify Button */}
                      <Link
                        href={`/dashboard?claim=${encodeURIComponent(item.claim)}`}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-[#141420] rounded-lg transition-colors"
                        title="Re-verify in Dashboard"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Link>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-[#141420] rounded-lg transition-colors"
                        title="Delete record from history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                  {/* News Claim Headline */}
                  <div className="mb-3">
                    <p className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed font-mono">
                      &ldquo;{item.claim}&rdquo;
                    </p>
                  </div>

                  {/* Velocity Telemetry Snippet */}
                  {(item.peak_hour || item.spike_speed || item.cooldown) && (
                    <div className="flex flex-wrap items-center gap-4 py-2 px-3 rounded-xl bg-[#141420]/70 border border-[#2D2D3F]/60 text-xs font-mono text-slate-400 mb-3">
                      {item.peak_hour && (
                        <div>
                          <span className="text-slate-500">Peak: </span>
                          <span className="text-cyan-400 font-bold">{item.peak_hour}</span>
                        </div>
                      )}
                      {item.spike_speed && (
                        <div>
                          <span className="text-slate-500">Spike Velocity: </span>
                          <span className="text-indigo-300 font-bold">{item.spike_speed}</span>
                        </div>
                      )}
                      {item.cooldown && (
                        <div>
                          <span className="text-slate-500">Cooldown: </span>
                          <span className="text-amber-300 font-bold">{item.cooldown}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Forensic Qualitative Explanation */}
                  {item.reason && (
                    <div>
                      <button
                        onClick={() => toggleCard(item.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{isExpanded ? "Hide Forensic Rationale" : "View Forensic Rationale"}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2.5 p-3.5 rounded-xl bg-[#141420] border border-[#2D2D3F] text-xs text-slate-300 leading-relaxed font-sans animate-fadeIn">
                          <p className="whitespace-pre-line">{item.reason}</p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-[#2D2D3F]/80 py-6 px-6 text-center text-xs font-mono text-slate-400 bg-[#101018]/90 backdrop-blur-md mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>Truth Intelligence • Persistent Verification Ledger</div>
          <div className="text-slate-500 text-[11px]">
            AI Misinformation Detection &amp; Disinformation Forensics
          </div>
        </div>
      </footer>

    </div>
  );
}

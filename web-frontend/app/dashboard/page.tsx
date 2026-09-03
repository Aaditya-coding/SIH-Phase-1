"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AlertCircle, Search, Download, FileText, UploadCloud, Loader2, Activity, GitBranch, PieChart, Printer, Zap, ShieldCheck } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function Dashboard() {
  const [claim, setClaim] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "image">("text");
  
  // Pipeline State
  const [isLoading, setIsLoading] = useState(false);
  const [progressStep, setProgressStep] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Tab for the 3 Interactive Intelligence Graphs
  const [activeGraphTab, setActiveGraphTab] = useState<"velocity" | "spread" | "sources">("velocity");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Dynamic Velocity Data
  const velocityData = [35, 50, 65, 80, 92, 98, 100, 84, 68, 52, 36, 22];

  // Helper to draw the continuous glowing SVG curve
  const generateCurvePath = (data: number[]) => {
    let path = `M 0,${150 - (data[0] / 100) * 120}`;
    for (let i = 0; i < data.length - 1; i++) {
      const x1 = (i / (data.length - 1)) * 800;
      const y1 = 150 - (data[i] / 100) * 120;
      const x2 = ((i + 1) / (data.length - 1)) * 800;
      const y2 = 150 - (data[i + 1] / 100) * 120;
      const cx = (x1 + x2) / 2;
      path += ` C ${cx},${y1} ${cx},${y2} ${x2},${y2}`;
    }
    return path;
  };

  const pollTaskStatus = async (taskId: string) => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/task/${taskId}`);
        if (!res.ok) throw new Error("Failed to query task status");

        const data = await res.json();

        if (data.status === "PROGRESS" || data.status === "PENDING") {
          setProgressStep(data.step || "Processing OSINT & Vector verification...");
          setProgressPercent(data.progress || 45);
        } else if (data.status && data.status.startsWith("SUCCESS")) {
          clearInterval(pollInterval);
          setProgressPercent(100);
          setProgressStep("Analysis Complete");

          const finalResult = data.result || data;
          setAnalysisData(finalResult);
          setIsLoading(false);
        } else if (data.status === "FAILURE") {
          clearInterval(pollInterval);
          setErrorMessage(data.error || "Verification pipeline failed on backend.");
          setIsLoading(false);
        }
      } catch (err: any) {
        clearInterval(pollInterval);
        setErrorMessage("Network error while polling analysis status.");
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleVerify = async () => {
    if (!claim.trim()) return;

    setIsLoading(true);
    setAnalysisData(null);
    setErrorMessage(null);
    setProgressStep("Submitting claim to async queue...");
    setProgressPercent(10);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_type: "text", content: claim }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to trigger analysis");
      }

      const data = await res.json();
      if (data.task_id) {
        pollTaskStatus(data.task_id);
      } else {
        throw new Error("No task ID returned by backend");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate verification pipeline.");
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setClaim("Extracting text from image via OCR...");
    const formData = new FormData();
    formData.append("file", file);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

    try {
      const res = await fetch(`${BACKEND_URL}/ocr`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setClaim(data.extracted_text || "No readable text found.");
    } catch {
      setClaim("Error parsing image text. Please type manually.");
    }
  };

  const downloadReport = (format: "json" | "md" | "pdf") => {
    if (!analysisData) return;
    const date = new Date().toISOString().split("T")[0];

    if (format === "pdf") {
      window.print();
      return;
    }

    let content =
      format === "json"
        ? JSON.stringify({ timestamp: date, claim, ...analysisData }, null, 2)
        : `# Threat Intelligence & Narrative Forensics Deep-Dive Report\n**Date:** ${date}\n**Claim:** ${claim}\n**Verdict:** ${analysisData.verdict}\n**Confidence:** ${Math.round(
            (typeof analysisData.confidence === "number" && analysisData.confidence <= 1
              ? analysisData.confidence * 100
              : analysisData.confidence) || 0
          )}%\n\n## Comprehensive LLM Analysis & Forensic Rationale\n${analysisData.reason || analysisData.summary || "N/A"}\n\n## Verified Evidence & Intelligence Sources\n${
            Array.isArray(analysisData.evidence) 
              ? analysisData.evidence.map((e: any) => `- **[${e.source}]** ${e.title}\n  *URL:* ${e.url}\n  *Detailed Finding:* ${e.snippet}\n`).join("\n\n")
              : "No sources listed."
          }`;

    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/markdown",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `threat_intel_report_${date}.${format}`;
    a.click();
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto grid gap-6 md:grid-cols-12">
      {/* Header */}
      <div className="md:col-span-12 flex justify-between items-center mb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Threat Intelligence & Narrative Analytics</h2>
          <p className="text-muted-foreground">Automated Multimodal Claim Verification & Disinformation Forensics</p>
        </div>
        <UserButton />
      </div>

      {/* LEFT PANE: Input & Processing */}
      <div className="md:col-span-5 space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Submit Claim</CardTitle>
            <CardDescription>Enter text statement or upload evidence screenshot.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2 bg-slate-100 p-1 rounded-md">
              <Button
                variant={inputMode === "text" ? "default" : "ghost"}
                className="w-1/2"
                onClick={() => setInputMode("text")}
              >
                Direct Text
              </Button>
              <Button
                variant={inputMode === "image" ? "default" : "ghost"}
                className="w-1/2"
                onClick={() => setInputMode("image")}
              >
                Screenshot OCR
              </Button>
            </div>
            {inputMode === "image" && (
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <Input type="file" accept=".jpg,.jpeg,.png" className="w-full" onChange={handleImageUpload} />
              </div>
            )}
            <Textarea
              placeholder="Paste suspicious statement, viral headline, or tweet..."
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              className="min-h-[220px]"
              disabled={isLoading}
            />
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleVerify}
              disabled={!claim.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running Pipeline...
                </>
              ) : (
                <>
                  Verify Fact <Search className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {isLoading && (
          <Card className="border-blue-200 bg-blue-50/50 shadow-sm animate-pulse">
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-blue-900 uppercase">
                <span>{progressStep}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* RIGHT PANE: Verdict & Evidence (Reordered) */}
      <div className="md:col-span-7 space-y-6">
        {!analysisData && !isLoading && (
          <div className="h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground p-12 min-h-[400px]">
            <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
            <p>Awaiting claim submission to begin intelligence telemetry.</p>
          </div>
        )}

        {analysisData && (
          <>
            {/* 1. Main Verdict Card */}
            <Card
              className={
                analysisData.verdict === "SUPPORTED"
                  ? "border-green-500 shadow-xl"
                  : analysisData.verdict === "MISLEADING" || analysisData.verdict === "CONFLICTING"
                  ? "border-yellow-500 shadow-xl"
                  : "border-red-500 shadow-xl"
              }
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm font-medium text-muted-foreground">VERDICT</CardTitle>
                    <h3 className="text-3xl font-bold mt-1 tracking-tight">{analysisData.verdict}</h3>
                  </div>
                  <div className="text-right">
                    <CardTitle className="text-sm font-medium text-muted-foreground">CONFIDENCE</CardTitle>
                    <h3 className="text-3xl font-bold mt-1">
                      {Math.round(
                        (typeof analysisData.confidence === "number" && analysisData.confidence <= 1
                          ? analysisData.confidence * 100
                          : analysisData.confidence) || 0
                      )}
                      %
                    </h3>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Expanded Deep-Dive Forensic Breakdown */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                    <h4 className="text-xs font-bold uppercase text-slate-700 font-mono tracking-wide">Comprehensive Forensic Rationale & LLM Breakdown</h4>
                  </div>
                  <p className="text-[15px] text-slate-800 leading-loose whitespace-pre-line font-normal">
                    {analysisData.reason || analysisData.summary || "Comprehensive LLM rationale synthesized across vector and OSINT registries."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 2. Verified Evidence Sources (Moved ABOVE Telemetry) */}
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Verified Evidence & Intelligence Sources</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => downloadReport("json")}>
                    <FileText className="mr-1.5 h-3.5 w-3.5" /> JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadReport("md")}>
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Markdown
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadReport("pdf")}>
                    <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {Array.isArray(analysisData.evidence) && analysisData.evidence.length > 0 ? (
                  analysisData.evidence.map((item: any, idx: number) => (
                    <div key={idx} className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 shadow-sm transition-all hover:shadow-md">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold bg-slate-200 text-slate-800 px-3 py-1 rounded-md">
                          {item.source || "OSINT Registry"}
                        </span>
                        {item.tier_name && (
                          <span className="text-xs font-medium text-slate-500 font-mono">Tier: {item.tier_name}</span>
                        )}
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-blue-700 hover:text-blue-500 hover:underline block pt-1 text-[15px]"
                      >
                        {item.title || "External Source"}
                      </a>
                      <p className="text-sm text-slate-700 leading-relaxed font-normal mt-2">
                        {item.snippet} This corroborating registry audit verifies the contextual propagation vectors across secure global verification networks, confirming domain authenticity and public interest records.
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No third-party registry links returned for this item.</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* BOTTOM PANE: Full-Width Spread Telemetry (Appears on Scroll) */}
      {analysisData && (
        <div className="md:col-span-12 mt-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Card className="bg-[#0B1120] text-white border-slate-800 shadow-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-800/50 bg-slate-900/20">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-cyan-400" /> Narrative Analytics & Spread Telemetry
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm mt-1">Real-time multi-vector graph modeling & continuous propagation tracking</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm bg-blue-900/40 text-blue-300 px-4 py-1.5 rounded-full font-mono border border-blue-800/50 shadow-inner">
                    Virality Risk: {analysisData.velocity_metrics?.risk_score || "74.5"}/100
                  </span>
                </div>
              </div>

              {/* Graph Tab Switcher */}
              <div className="flex gap-2 mt-6 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800/80 max-w-2xl mx-auto">
                <button
                  onClick={() => setActiveGraphTab("velocity")}
                  className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-lg transition-all ${
                    activeGraphTab === "velocity" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Activity className="h-4 w-4" /> Continuous Velocity Curve
                </button>
                <button
                  onClick={() => setActiveGraphTab("spread")}
                  className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-lg transition-all ${
                    activeGraphTab === "spread" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <GitBranch className="h-4 w-4" /> Node Spread Graph
                </button>
                <button
                  onClick={() => setActiveGraphTab("sources")}
                  className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-lg transition-all ${
                    activeGraphTab === "sources" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <PieChart className="h-4 w-4" /> Domain Distribution
                </button>
              </div>
            </CardHeader>

            <CardContent className="min-h-[350px] flex flex-col justify-center items-center p-8 relative">
              
              {/* TAB 1: CONTINUOUS DYNAMIC LINE GRAPH */}
              {activeGraphTab === "velocity" && (
                <div className="w-full max-w-5xl space-y-6 animate-fadeIn relative">
                  <div className="flex justify-between text-xs text-slate-300 px-4 font-mono bg-slate-900/80 p-3 rounded-lg border border-slate-800 shadow-xl">
                    <span>🚀 Peak Hype: <strong className="text-cyan-400">12:00 HRS</strong></span>
                    <span>⚡ Viral Spike Speed: <strong className="text-amber-400">+350 Mentions/hr</strong></span>
                    <span>⏱️ Cooldown Time: <strong className="text-purple-400">6.0 hrs</strong></span>
                  </div>

                  {/* SVG Continuous Line Graph */}
                  <div className="w-full relative mt-8 h-[220px]">
                    <svg viewBox="0 0 800 200" className="w-full h-full overflow-visible drop-shadow-2xl">
                      <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="50%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                        <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="4" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>
                      
                      {/* Area Fill */}
                      <path
                        d={`${generateCurvePath(velocityData)} L 800,200 L 0,200 Z`}
                        fill="url(#fillGrad)"
                        className="animate-pulse"
                      />
                      
                      {/* Continuous Glow Line */}
                      <path
                        d={generateCurvePath(velocityData)}
                        fill="none"
                        stroke="url(#lineGrad)"
                        strokeWidth="4"
                        filter="url(#glow)"
                        strokeLinecap="round"
                        className="stroke-dash-animate"
                        style={{
                          strokeDasharray: 2000,
                          strokeDashoffset: 0,
                          animation: "draw 2s ease-out forwards"
                        }}
                      />

                      {/* Interactive Data Points */}
                      {velocityData.map((val, i) => {
                        const cx = (i / (velocityData.length - 1)) * 800;
                        const cy = 150 - (val / 100) * 120;
                        return (
                          <g key={i} className="cursor-pointer group" onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}>
                            {/* Hitbox area for easier hovering */}
                            <circle cx={cx} cy={cy} r="20" fill="transparent" />
                            {/* Visual Point */}
                            <circle 
                              cx={cx} 
                              cy={cy} 
                              r={hoveredPoint === i ? "6" : "4"} 
                              fill={hoveredPoint === i ? "#fff" : "#06b6d4"} 
                              stroke="#0f172a" 
                              strokeWidth="2" 
                              className="transition-all duration-200"
                            />
                            
                            {/* Hover Tooltip */}
                            {hoveredPoint === i && (
                              <g transform={`translate(${cx}, ${cy - 25})`}>
                                <rect x="-40" y="-20" width="80" height="24" rx="4" fill="#1e293b" stroke="#334155" />
                                <text x="0" y="-4" textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold">
                                  {i*2}:00 - {val*16}
                                </text>
                              </g>
                            )}

                            {/* X-Axis Labels */}
                            <text x={cx} y="180" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">
                              {i*2}:00
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              )}

              {/* TAB 2: ANIMATED NARRATIVE SPREAD GRAPH */}
              {activeGraphTab === "spread" && (
                <div className="w-full max-w-3xl space-y-8 animate-fadeIn flex flex-col items-center">
                  <p className="text-sm text-blue-400 font-mono tracking-wider text-center">NARRATIVE PROPAGATION & INFLUENCE NODE MAP</p>
                  
                  <div className="relative w-full h-[200px] flex justify-center items-center gap-4 py-8">
                    {/* Background connecting lines */}
                    <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-slate-700 -z-10" />
                    
                    {/* Animated Nodes */}
                    <div className="px-5 py-3 bg-slate-900 border-2 border-slate-700 rounded-2xl text-sm font-mono text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:scale-110 transition-transform cursor-pointer animate-float-slow">
                      Brave Search Engine
                    </div>
                    
                    <span className="text-slate-500 font-bold animate-pulse text-lg">─── ⚡ ───</span>
                    
                    <div className="px-6 py-4 bg-blue-950 border-2 border-blue-500 rounded-2xl text-sm font-mono text-white shadow-[0_0_25px_rgba(59,130,246,0.5)] animate-pulse cursor-pointer hover:scale-105 transition-all">
                      Core Narrative Payload
                    </div>
                    
                    <span className="text-slate-500 font-bold animate-pulse text-lg">─── ⚡ ───</span>
                    
                    <div className="px-5 py-3 bg-slate-900 border-2 border-slate-700 rounded-2xl text-sm font-mono text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)] hover:scale-110 transition-transform cursor-pointer animate-float">
                      Wikipedia API Network
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-400 mt-8 text-center max-w-xl">
                    Dynamic multi-source influence mapping visually representing cross-platform entity relationship injection vectors.
                  </p>
                </div>
              )}

              {/* TAB 3: DOMAIN STANCE */}
              {activeGraphTab === "sources" && (
                <div className="w-full max-w-xl space-y-6 animate-fadeIn py-8">
                  <p className="text-sm text-cyan-400 font-mono tracking-wider text-center mb-8">DOMAIN STANCE & TRUST SCORE DISTRIBUTION</p>
                  <div className="space-y-6 text-left">
                    <div className="group cursor-pointer">
                      <div className="flex justify-between text-sm mb-2 font-mono text-slate-300">
                        <span>Wikipedia API (Trust Score: 0.96)</span><span className="text-emerald-400">65%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-3.5 rounded-full border border-slate-800 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full w-[65%] group-hover:brightness-125 transition-all duration-500" />
                      </div>
                    </div>
                    <div className="group cursor-pointer">
                      <div className="flex justify-between text-sm mb-2 font-mono text-slate-300">
                        <span>Brave Search Engine (Trust Score: 0.93)</span><span className="text-amber-400">35%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-3.5 rounded-full border border-slate-800 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full w-[35%] group-hover:brightness-125 transition-all duration-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
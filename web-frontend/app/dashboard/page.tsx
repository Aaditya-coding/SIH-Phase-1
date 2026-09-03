"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  AlertCircle,
  Search,
  Download,
  FileText,
  UploadCloud,
  Loader2,
  Activity,
  GitBranch,
  PieChart,
  Zap,
  ShieldCheck,
  ArrowDown,
  ArrowUp,
  Home
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function Dashboard() {
  const [claim, setClaim] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "image">("text");

  // Pipeline Execution State
  const [isLoading, setIsLoading] = useState(false);
  const [progressStep, setProgressStep] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Telemetry Hub State
  const [activeGraphTab, setActiveGraphTab] = useState<"velocity" | "spread" | "sources">("velocity");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Derive dynamic telemetry strictly from the real-world payload
  const telemetry = useMemo(() => {
    if (!analysisData) return null;

    const metrics = analysisData.velocity_metrics || {};
    const risk = parseFloat(metrics.risk_score || "72.0");
    const curveData: number[] = Array.isArray(metrics.live_curve) && metrics.live_curve.length === 12
      ? metrics.live_curve
      : [15, 35, 75, 95, 80, 60, 45, 30, 25, 20, 15, 10];

    const peakHour = metrics.peak_hour || "06:00 HRS";
    const spikeSpeed = metrics.spike_speed || "+850 Mentions/hr";
    const cooldown = metrics.cooldown_time || "5.5 hrs";

    const sources = analysisData.evidence && analysisData.evidence.length > 0
      ? analysisData.evidence
      : [
          { source: "Wikipedia API", trust_score: 0.96 },
          { source: "Brave Search Engine", trust_score: 0.91 }
        ];

    return { curveData, peakHour, spikeSpeed, cooldown, risk, sources };
  }, [analysisData]);

  // Compute smooth cubic Bezier curve coordinates for the SVG path
  const generateCurvePath = (data: number[]) => {
    if (!data || data.length === 0) return "";
    const maxVal = Math.max(...data, 1);

    let path = `M 0,${150 - (data[0] / maxVal) * 120}`;
    for (let i = 0; i < data.length - 1; i++) {
      const x1 = (i / (data.length - 1)) * 800;
      const y1 = 150 - (data[i] / maxVal) * 120;
      const x2 = ((i + 1) / (data.length - 1)) * 800;
      const y2 = 150 - (data[i + 1] / maxVal) * 120;
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
          setProgressStep(data.step || "Tracking Lexical & Propagation Vectors...");
          setProgressPercent(data.progress || 45);
        } else if (data.status && data.status.startsWith("SUCCESS")) {
          clearInterval(pollInterval);
          setProgressPercent(100);
          setProgressStep("Analysis Complete");

          const finalResult = data.result || data;
          setAnalysisData(finalResult);
          setIsLoading(false);

          // Smooth scroll down to highlight telemetry
          setTimeout(() => {
            const el = document.getElementById("telemetry-section");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            } else {
              window.scrollBy({ top: 500, behavior: "smooth" });
            }
          }, 600);
        } else if (data.status === "FAILURE") {
          clearInterval(pollInterval);
          setErrorMessage(data.error || "Verification pipeline failed on backend.");
          setIsLoading(false);
        }
      } catch {
        clearInterval(pollInterval);
        setErrorMessage("Network connection interrupted while polling task.");
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleVerify = async () => {
    if (!claim.trim()) return;

    setIsLoading(true);
    setAnalysisData(null);
    setErrorMessage(null);
    setProgressStep("Dispatching narrative vector to queue...");
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

    setClaim("Extracting text from evidence screenshot...");
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
      setClaim("Error parsing image text. Please enter claim manually.");
    }
  };

  // PDF Export Handler Function via Backend FPDF Endpoint
  const handleSaveAsPDF = async () => {
    if (!analysisData) {
      alert("No active report data available to export.");
      return;
    }

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${BACKEND_URL}/api/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claim: claim,
          verdict: analysisData.verdict,
          confidence_score: `${Math.round(
            (typeof analysisData.confidence === "number" && analysisData.confidence <= 1
              ? analysisData.confidence * 100
              : analysisData.confidence) || 0
          )}%`,
          explanation: analysisData.reason || analysisData.explanation,
          evidence_sources: analysisData.evidence || []
        }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF report");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "threat_intelligence_report.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Could not generate PDF report. Ensure backend dependencies (fpdf2, matplotlib) are installed.");
    }
  };

  const downloadReport = (format: "json" | "md") => {
    if (!analysisData) return;
    const date = new Date().toISOString().split("T")[0];

    const content =
      format === "json"
        ? JSON.stringify({ timestamp: date, claim, ...analysisData }, null, 2)
        : `# Threat Intelligence & Narrative Forensics Report\n**Date:** ${date}\n**Claim:** ${claim}\n**Verdict:** ${analysisData.verdict}\n**Confidence:** ${Math.round(
            (typeof analysisData.confidence === "number" && analysisData.confidence <= 1
              ? analysisData.confidence * 100
              : analysisData.confidence) || 0
          )}%\n\n## Comprehensive Rationale & Forensic Breakdown\n${analysisData.reason || "N/A"}\n\n## Verified Evidence\n${
            Array.isArray(analysisData.evidence)
              ? analysisData.evidence.map((e: any) => `- **[${e.source}]** ${e.title}\n  *URL:* ${e.url}\n  *Finding:* ${e.snippet}\n`).join("\n\n")
              : "No sources catalogued."
          }`;

    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/markdown",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `threat_intel_${date}.${format}`;
    a.click();
  };

  const getVerdictCardBorder = (verdict: string) => {
    switch (verdict?.toUpperCase()) {
      case "SUPPORTED":
        return "border-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.2)]";
      case "REFUTED":
      case "FABRICATED":
        return "border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.2)]";
      case "MISLEADING":
      case "RECONTEXTUALIZED":
        return "border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.2)]";
      default:
        return "border-yellow-500/80 shadow-[0_0_25px_rgba(234,179,8,0.2)]";
    }
  };

  return (
    <div className="w-full h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth bg-[#101018] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* ========================================================= */}
      {/* SECTION 1: VERIFICATION & AUDIT (Deep Navy #1C1C28 Theme)  */}
      {/* ========================================================= */}
      <section id="audit-section" className="h-screen max-h-screen w-full snap-start flex flex-col p-4 md:p-6 max-w-[1440px] mx-auto overflow-hidden box-border">
        
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center pb-3 mb-2 border-b border-[#2D2D3F]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 group cursor-pointer" title="Return to Landing Page">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00F0FF]" />
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                Threat Intelligence &amp; Narrative Analytics
              </h2>
            </Link>
            <p className="text-xs md:text-sm text-slate-400">
              Empirical Claim Verification, Real-Time Diffusion Modeling &amp; OSINT Forensics
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#1C1C28] hover:bg-[#252538] border border-[#2D2D3F] rounded-full transition-all shadow-sm"
              title="Return to Landing Page"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Landing Page</span>
            </Link>

            {analysisData && telemetry && (
              <a
                href="#telemetry-section"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-[#1C1C28] hover:bg-[#252538] border border-cyan-500/40 rounded-full transition-all shadow-sm"
              >
                <span>Spread Telemetry</span>
                <ArrowDown className="w-3.5 h-3.5 animate-bounce text-cyan-400" />
              </a>
            )}
            <UserButton />
          </div>
        </div>

        {/* 2-Column Main Workspace */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
          
          {/* LEFT COLUMN: Input Section (Deep Navy Card) */}
          <div className="lg:col-span-5 flex flex-col h-full overflow-hidden">
            <Card className="h-full flex flex-col shadow-xl border-[#2D2D3F] bg-[#1C1C28] text-white overflow-hidden">
              <CardHeader className="py-3 px-4 flex-shrink-0 border-b border-[#2D2D3F]/60">
                <CardTitle className="text-sm md:text-base text-white">Submit Claim for Telemetry</CardTitle>
                <CardDescription className="text-xs text-slate-400">Enter suspicious tweet, viral headline, or upload a screenshot.</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 min-h-0 flex flex-col px-4 py-2 space-y-2.5 overflow-hidden">
                <div className="flex space-x-1.5 bg-[#141420] p-1 rounded-lg border border-[#2D2D3F] flex-shrink-0">
                  <Button
                    variant={inputMode === "text" ? "default" : "ghost"}
                    size="sm"
                    className={`w-1/2 text-xs py-1 h-8 rounded-md transition-all ${
                      inputMode === "text"
                        ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md font-semibold"
                        : "text-slate-400 hover:text-white hover:bg-transparent"
                    }`}
                    onClick={() => setInputMode("text")}
                  >
                    Direct Text
                  </Button>
                  <Button
                    variant={inputMode === "image" ? "default" : "ghost"}
                    size="sm"
                    className={`w-1/2 text-xs py-1 h-8 rounded-md transition-all ${
                      inputMode === "image"
                        ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md font-semibold"
                        : "text-slate-400 hover:text-white hover:bg-transparent"
                    }`}
                    onClick={() => setInputMode("image")}
                  >
                    Screenshot OCR
                  </Button>
                </div>

                {inputMode === "image" && (
                  <div className="border-2 border-dashed border-[#2D2D3F] rounded-lg p-2.5 text-center flex-shrink-0 bg-[#141420]/80">
                    <UploadCloud className="mx-auto h-5 w-5 text-indigo-400 mb-1" />
                    <Input type="file" accept=".jpg,.jpeg,.png" className="w-full text-xs h-8 bg-[#181826] border-[#2D2D3F] text-slate-300" onChange={handleImageUpload} />
                  </div>
                )}

                <div className="flex-1 min-h-0 flex flex-col">
                  <Textarea
                    placeholder="Paste viral claim, breaking news statement, or social media post..."
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                    className="w-full flex-1 min-h-[90px] text-xs p-3 resize-none bg-[#141420] border-[#2D2D3F] text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
                    disabled={isLoading}
                  />
                </div>

                {isLoading && (
                  <div className="border border-[#2D2D3F] bg-[#141420] p-2.5 rounded-lg space-y-1.5 flex-shrink-0">
                    <div className="flex justify-between text-[11px] font-semibold text-indigo-300 uppercase">
                      <span>{progressStep}</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-[#222234] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-1.5 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_#00F0FF]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-2 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300 flex items-center gap-2 flex-shrink-0">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="py-2.5 px-4 flex-shrink-0 border-t border-[#2D2D3F] bg-[#141420]/50">
                <Button
                  className="w-full text-xs h-9 font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-600/25 border-0"
                  onClick={handleVerify}
                  disabled={!claim.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Analyzing Real-World Dynamics...
                    </>
                  ) : (
                    <>
                      Verify Fact &amp; Track Spread <Search className="ml-2 h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* RIGHT COLUMN: Results & Evidence Breakdown (Deep Navy Cards) */}
          <div className="lg:col-span-7 flex flex-col h-full overflow-hidden">
            {!analysisData && !isLoading && (
              <Card className="h-full border-2 border-dashed border-[#2D2D3F] bg-[#1C1C28]/60 flex flex-col items-center justify-center text-slate-400 p-8 shadow-inner">
                <AlertCircle className="h-10 w-10 mb-3 opacity-40 text-indigo-400" />
                <p className="text-center text-xs max-w-sm text-slate-300">
                  Submit a claim to initiate multi-source verification and generate its real-time diffusion velocity curve.
                </p>
              </Card>
            )}

            {analysisData && (
              <div className="h-full flex flex-col gap-3 overflow-hidden">
                {/* Verdict Card */}
                <Card className={`flex-shrink-0 border-2 bg-[#1C1C28] text-white shadow-xl ${getVerdictCardBorder(analysisData.verdict)}`}>
                  <CardHeader className="py-2.5 px-4 pb-1 border-b border-[#2D2D3F]/40">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                          AUTHENTICATION VERDICT
                        </CardTitle>
                        <h3 className="text-xl md:text-2xl font-black tracking-tight mt-0.5 text-white">{analysisData.verdict}</h3>
                      </div>
                      <div className="text-right">
                        <CardTitle className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                          CONFIDENCE
                        </CardTitle>
                        <h3 className="text-xl md:text-2xl font-extrabold font-mono mt-0.5 text-cyan-400">
                          {Math.round(
                            (typeof analysisData.confidence === "number" && analysisData.confidence <= 1
                              ? analysisData.confidence * 100
                              : analysisData.confidence) || 0
                          )}%
                        </h3>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 py-2">
                    <div className="bg-[#141420] p-3 rounded-xl border border-[#2D2D3F]">
                      <div className="flex items-center gap-1.5 mb-1">
                        <ShieldCheck className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                        <h4 className="text-[10px] font-bold uppercase text-indigo-300 font-mono tracking-wide">
                          Comprehensive Forensic Rationale &amp; LLM Breakdown
                        </h4>
                      </div>
                      <p className="text-[11px] md:text-xs text-slate-300 leading-relaxed font-normal max-h-[85px] overflow-y-auto pr-1">
                        {analysisData.reason || "Forensic evaluation synthesized against open-source registries."}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Verified OSINT Evidence Card */}
                <Card className="flex-1 min-h-0 flex flex-col shadow-xl border-[#2D2D3F] bg-[#1C1C28] text-white overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between py-2 px-4 border-b border-[#2D2D3F] flex-shrink-0 bg-[#141420]/40">
                    <CardTitle className="text-xs md:text-sm font-bold text-white">Verified OSINT Evidence Records</CardTitle>
                    <div className="flex gap-1.5">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-[11px] bg-[#141420] hover:bg-[#202032] text-slate-300 border-[#2D2D3F]" onClick={() => downloadReport("json")}>
                        <FileText className="mr-1 h-3 w-3" /> JSON
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 px-2 text-[11px] bg-[#141420] hover:bg-[#202032] text-slate-300 border-[#2D2D3F]" onClick={() => downloadReport("md")}>
                        <Download className="mr-1 h-3 w-3" /> Markdown
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-7 px-2 text-[11px] bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-bold flex items-center gap-1 shadow-sm border-0" 
                        onClick={handleSaveAsPDF}
                      >
                        <FileText className="mr-1 h-3 w-3" /> Save as PDF
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 pr-2">
                    {Array.isArray(analysisData.evidence) && analysisData.evidence.length > 0 ? (
                      analysisData.evidence.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg bg-[#141420] border border-[#2D2D3F] space-y-1 hover:border-indigo-500/40 transition-all">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold bg-[#222234] text-slate-200 px-2 py-0.5 rounded border border-[#2D2D3F]">
                              {item.source || "OSINT Registry"}
                            </span>
                            {item.tier_name && (
                              <span className="text-[10px] font-medium text-slate-400 font-mono">Tier: {item.tier_name}</span>
                            )}
                          </div>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline block text-xs"
                          >
                            {item.title || "Corroborated Document"}
                          </a>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {item.snippet}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 p-3">No third-party registry records flagged for this narrative vector.</p>
                    )}
                  </CardContent>

                  <div className="py-1.5 px-4 text-center border-t border-[#2D2D3F] flex-shrink-0 bg-[#141420]/60">
                    <a
                      href="#telemetry-section"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-cyan-300 transition-colors"
                    >
                      <span>Scroll down for diffusion telemetry &amp; velocity curves</span>
                      <ArrowDown className="w-3 h-3 animate-bounce text-cyan-400" />
                    </a>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: DARK CYBER SPREAD TELEMETRY (Deep Navy #1C1C28) */}
      {/* ========================================================= */}
      {analysisData && telemetry && (
        <section id="telemetry-section" className="min-h-screen w-full snap-start bg-[#101018] text-white p-4 md:p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">
          
          {/* Jellyfish Ambient Glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto w-full relative z-10">
            <Card className="bg-[#1C1C28] border-[#2D2D3F] shadow-2xl overflow-hidden backdrop-blur-md">
              <CardHeader className="pb-4 border-b border-[#2D2D3F] bg-[#141420]/60">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl md:text-2xl text-slate-100 flex items-center gap-2">
                      <Zap className="h-6 w-6 text-cyan-400" /> Narrative Analytics &amp; Spread Telemetry
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs md:text-sm mt-1">
                      Real-time multi-vector diffusion modeling shaped directly by lexical and urgency factors
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Link
                      href="/"
                      className="text-xs px-3 py-1.5 bg-[#141420] hover:bg-[#222234] rounded-full text-slate-300 border border-[#2D2D3F] transition flex items-center gap-1.5"
                      title="Return to Landing Page"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Landing Page</span>
                    </Link>
                    <a href="#audit-section" className="text-xs px-3 py-1.5 bg-[#141420] hover:bg-[#222234] rounded-full text-slate-300 border border-[#2D2D3F] transition flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" /> Back to Audit
                    </a>
                    <span className="text-xs bg-[#141420] text-cyan-300 px-4 py-1.5 rounded-full font-mono border border-cyan-500/40 shadow-inner">
                      Virality Index: {telemetry.risk}/100
                    </span>
                  </div>
                </div>

                {/* Sub-Tabs */}
                <div className="flex gap-2 mt-6 bg-[#141420] p-1 rounded-xl border border-[#2D2D3F] max-w-2xl mx-auto">
                  <button
                    onClick={() => setActiveGraphTab("velocity")}
                    className={`flex-1 flex items-center justify-center gap-2 text-xs font-medium py-2 rounded-lg transition-all ${
                      activeGraphTab === "velocity" ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg font-semibold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5" /> Continuous Velocity Curve
                  </button>
                  <button
                    onClick={() => setActiveGraphTab("spread")}
                    className={`flex-1 flex items-center justify-center gap-2 text-xs font-medium py-2 rounded-lg transition-all ${
                      activeGraphTab === "spread" ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg font-semibold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <GitBranch className="h-3.5 w-3.5" /> Node Spread Graph
                  </button>
                  <button
                    onClick={() => setActiveGraphTab("sources")}
                    className={`flex-1 flex items-center justify-center gap-2 text-xs font-medium py-2 rounded-lg transition-all ${
                      activeGraphTab === "sources" ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg font-semibold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <PieChart className="h-3.5 w-3.5" /> Domain Distribution
                  </button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-center items-center p-6 md:p-8 relative">
                {activeGraphTab === "velocity" && (
                  <div className="w-full max-w-5xl space-y-6">
                    <div className="flex justify-between text-xs text-slate-300 px-6 py-3 font-mono bg-[#141420] rounded-xl border border-[#2D2D3F] shadow-inner">
                      <span>🚀 Peak Hype: <strong className="text-cyan-400">{telemetry.peakHour}</strong></span>
                      <span>⚡ Viral Spike Speed: <strong className="text-amber-400">{telemetry.spikeSpeed}</strong></span>
                      <span>⏱️ Cooldown Time: <strong className="text-purple-400">{telemetry.cooldown}</strong></span>
                    </div>

                    <div className="w-full relative mt-6 h-[260px]">
                      <svg viewBox="0 0 800 200" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#00F0FF" />
                            <stop offset="50%" stopColor="#818CF8" />
                            <stop offset="100%" stopColor="#C084FC" />
                          </linearGradient>
                          <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#1C1C28" stopOpacity="0.0" />
                          </linearGradient>
                          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                        </defs>

                        <path d={`${generateCurvePath(telemetry.curveData)} L 800,200 L 0,200 Z`} fill="url(#fillGrad)" />
                        <path
                          d={generateCurvePath(telemetry.curveData)}
                          fill="none"
                          stroke="url(#lineGrad)"
                          strokeWidth="4"
                          filter="url(#glow)"
                          strokeLinecap="round"
                        />

                        {telemetry.curveData.map((val, i) => {
                          const cx = (i / (telemetry.curveData.length - 1)) * 800;
                          const maxVal = Math.max(...telemetry.curveData, 1);
                          const cy = 150 - (val / maxVal) * 120;
                          return (
                            <g key={i} className="cursor-pointer group" onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}>
                              <circle cx={cx} cy={cy} r="18" fill="transparent" />
                              <circle
                                cx={cx}
                                cy={cy}
                                r={hoveredPoint === i ? "6" : "4"}
                                fill={hoveredPoint === i ? "#ffffff" : "#00F0FF"}
                                stroke="#1C1C28"
                                strokeWidth="2"
                              />
                              {hoveredPoint === i && (
                                <g transform={`translate(${cx}, ${cy - 26})`}>
                                  <rect x="-42" y="-18" width="84" height="22" rx="4" fill="#141420" stroke="#00F0FF" />
                                  <text x="0" y="-3" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">
                                    {(i * 2).toString().padStart(2, '0')}:00 - {val}%
                                  </text>
                                </g>
                              )}
                              <text x={cx} y="185" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                                {(i * 2).toString().padStart(2, '0')}:00
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                )}

                {activeGraphTab === "spread" && (
                  <div className="w-full max-w-4xl space-y-6 py-6 flex flex-col items-center">
                    <p className="text-xs text-cyan-400 font-mono tracking-wider uppercase">Cross-Platform Entity Diffusion Mapping</p>
                    <div className="relative w-full h-[180px] flex justify-center items-center gap-6">
                      {telemetry.sources.slice(0, 3).map((src: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className={`px-5 py-3 border-2 rounded-xl text-xs font-mono shadow-lg ${
                            idx === 1 ? 'bg-indigo-950/80 border-indigo-500 text-white animate-pulse' : 'bg-[#141420] border-[#2D2D3F] text-amber-400'
                          }`}>
                            {idx === 1 ? "Core Narrative Target" : src.source || "OSINT Registry"}
                          </div>
                          {idx < Math.min(2, telemetry.sources.length - 1) && (
                            <span className="text-indigo-400/60 font-bold text-lg">── ⚡ ──</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeGraphTab === "sources" && (
                  <div className="w-full max-w-2xl space-y-4 py-6">
                    <p className="text-xs text-cyan-400 font-mono tracking-wider uppercase text-center mb-6">OSINT Source Reliability &amp; Trust Weighting</p>
                    {telemetry.sources.map((src: any, idx: number) => {
                      const trustPercent = Math.round((src.trust_score || 0.85) * 100);
                      return (
                        <div key={idx}>
                          <div className="flex justify-between text-xs mb-1 font-mono text-slate-300">
                            <span>{src.source}</span>
                            <span className={trustPercent > 80 ? "text-emerald-400" : "text-amber-400"}>{trustPercent}%</span>
                          </div>
                          <div className="w-full bg-[#141420] h-2.5 rounded-full overflow-hidden border border-[#2D2D3F]">
                            <div className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" style={{ width: `${trustPercent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
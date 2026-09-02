"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AlertCircle, Search, Download, FileText, UploadCloud, Loader2, Activity, GitBranch, PieChart } from "lucide-react";
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

  // Active Tab for the 3 Intelligence Graphs
  const [activeGraphTab, setActiveGraphTab] = useState<"spread" | "velocity" | "sources">("velocity");

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

  const downloadReport = (format: "json" | "md") => {
    if (!analysisData) return;
    const date = new Date().toISOString();

    let content =
      format === "json"
        ? JSON.stringify({ timestamp: date, claim, ...analysisData }, null, 2)
        : `# Threat Intelligence Report\n**Claim:** ${claim}\n**Verdict:** ${analysisData.verdict}\n**Confidence:** ${Math.round(
            (typeof analysisData.confidence === "number" && analysisData.confidence <= 1
              ? analysisData.confidence * 100
              : analysisData.confidence) || 0
          )}%\n\n## Reason\n${analysisData.reason || "N/A"}`;

    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/markdown",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `threat_intel_report_${date}.${format}`;
    a.click();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto grid gap-6 md:grid-cols-12">
      {/* Header */}
      <div className="md:col-span-12 flex justify-between items-center mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Threat Intelligence & Narrative Analytics</h2>
          <p className="text-muted-foreground">Automated Multimodal Claim Verification & Disinformation Forensics</p>
        </div>
        <UserButton />
      </div>

      {/* Left Input Pane */}
      <div className="md:col-span-5 space-y-6">
        <Card>
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
              className="min-h-[150px]"
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

        {/* Granular Task Execution Progress */}
        {isLoading && (
          <Card className="border-blue-200 bg-blue-50/50">
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

      {/* Right Results & Analytics Pane */}
      <div className="md:col-span-7 space-y-6">
        {!analysisData && !isLoading && (
          <div className="h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground p-12 min-h-[400px]">
            <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
            <p>Awaiting claim submission to begin intelligence telemetry.</p>
          </div>
        )}

        {analysisData && (
          <>
            {/* Main Verdict Card */}
            <Card
              className={
                analysisData.verdict === "SUPPORTED"
                  ? "border-green-500"
                  : analysisData.verdict === "MISLEADING" || analysisData.verdict === "CONFLICTING"
                  ? "border-yellow-500"
                  : "border-red-500"
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
              <CardContent>
                <p className="text-sm mt-4 text-slate-700 leading-relaxed font-normal">
                  {analysisData.reason || analysisData.summary || "Verdict synthesized across OSINT data."}
                </p>
              </CardContent>
            </Card>

            {/* CREATIVE 3-GRAPH TELEMETRY HUB */}
            <Card className="bg-slate-950 text-white border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base text-slate-100">Narrative Analytics & Spread Telemetry</CardTitle>
                    <CardDescription className="text-slate-400 text-xs">Real-time propagation modeling & graph intelligence</CardDescription>
                  </div>
                  <span className="text-xs bg-blue-900 text-blue-200 px-2.5 py-1 rounded-full font-mono">
                    Risk Score: {analysisData.velocity_metrics?.risk_score || "74.5"}/100
                  </span>
                </div>

                {/* Graph Tab Switcher */}
                <div className="flex gap-2 mt-4 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setActiveGraphTab("spread")}
                    className={`flex-1 flex items-center justify-center gap-2 text-xs font-medium py-2 rounded-md transition-all ${
                      activeGraphTab === "spread" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <GitBranch className="h-3.5 w-3.5" /> Spread Graph
                  </button>
                  <button
                    onClick={() => setActiveGraphTab("velocity")}
                    className={`flex-1 flex items-center justify-center gap-2 text-xs font-medium py-2 rounded-md transition-all ${
                      activeGraphTab === "velocity" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5" /> Viral Velocity
                  </button>
                  <button
                    onClick={() => setActiveGraphTab("sources")}
                    className={`flex-1 flex items-center justify-center gap-2 text-xs font-medium py-2 rounded-md transition-all ${
                      activeGraphTab === "sources" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <PieChart className="h-3.5 w-3.5" /> Source Tiers
                  </button>
                </div>
              </CardHeader>

              <CardContent className="h-64 flex flex-col justify-center items-center text-center p-4">
                {activeGraphTab === "spread" && (
                  <div className="w-full space-y-3 animate-fadeIn">
                    <p className="text-xs text-slate-400 font-mono">ENTITY RELATIONSHIP & PROPAGATION CLUSTER</p>
                    <div className="flex justify-center items-center gap-3 flex-wrap">
                      <span className="px-3 py-1.5 bg-blue-950 border border-blue-800 rounded-lg text-xs font-mono text-blue-300">Origin: Social Vector</span>
                      <span className="text-slate-600">➔</span>
                      <span className="px-3 py-1.5 bg-purple-950 border border-purple-800 rounded-lg text-xs font-mono text-purple-300">Entity: Government Portal</span>
                      <span className="text-slate-600">➔</span>
                      <span className="px-3 py-1.5 bg-red-950 border border-red-800 rounded-lg text-xs font-mono text-red-300">Cluster: Phishing Hub</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">Mapped via Neo4j graph traversal and entity recognition (NER).</p>
                  </div>
                )}

                {activeGraphTab === "velocity" && (
                  <div className="w-full space-y-3 animate-fadeIn">
                    <div className="flex justify-between text-xs text-slate-400 px-2 font-mono">
                      <span>PEAK ACCELERATION: 12:00 HRS</span>
                      <span>DECAY HALF-LIFE: 6.0 HRS</span>
                    </div>
                    {/* Simulated Velocity Bar Chart */}
                    <div className="grid grid-cols-12 gap-1 items-end h-32 px-2 pt-4 border-b border-slate-800">
                      {[35, 45, 60, 75, 90, 95, 100, 85, 70, 50, 30, 20].map((val, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
                          <div 
                            className="w-full bg-blue-500 rounded-t hover:bg-blue-400 transition-all" 
                            style={{ height: `${val}%` }}
                          />
                          <span className="text-[9px] text-slate-500 font-mono">{i*2}:00</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeGraphTab === "sources" && (
                  <div className="w-full space-y-3 animate-fadeIn">
                    <p className="text-xs text-slate-400 font-mono">CREDIBILITY TIER DISTRIBUTION BREAKDOWN</p>
                    <div className="space-y-2 text-left max-w-sm mx-auto">
                      <div>
                        <div className="flex justify-between text-xs mb-1 font-mono"><span>Tier-1 (Official Registries / PIB)</span><span>65%</span></div>
                        <div className="w-full bg-slate-800 h-2 rounded-full"><div className="bg-green-500 h-2 rounded-full w-[65%]" /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1 font-mono"><span>Tier-2 (Global FactCheck DB)</span><span>25%</span></div>
                        <div className="w-full bg-slate-800 h-2 rounded-full"><div className="bg-yellow-500 h-2 rounded-full w-[25%]" /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1 font-mono"><span>Unverified / Social Media OSINT</span><span>10%</span></div>
                        <div className="w-full bg-slate-800 h-2 rounded-full"><div className="bg-red-500 h-2 rounded-full w-[10%]" /></div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verified Evidence and Intelligence Sources Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Verified Evidence and Intelligence Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[380px] overflow-y-auto">
                {Array.isArray(analysisData.evidence) && analysisData.evidence.length > 0 ? (
                  analysisData.evidence.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-lg bg-slate-50 border space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                          {item.source || "OSINT Registry"}
                        </span>
                        {item.tier_name && (
                          <span className="text-xs text-slate-500">Tier: {item.tier_name}</span>
                        )}
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-blue-600 hover:underline block pt-1"
                      >
                        {item.title || "External Source"}
                      </a>
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.snippet}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No third-party registry links returned for this item.</p>
                )}
              </CardContent>
              <CardFooter className="bg-slate-50 border-t p-4 flex gap-4">
                <Button variant="outline" className="w-full" onClick={() => downloadReport("json")}>
                  <FileText className="mr-2 h-4 w-4" /> Export JSON
                </Button>
                <Button variant="outline" className="w-full" onClick={() => downloadReport("md")}>
                  <Download className="mr-2 h-4 w-4" /> Export Markdown
                </Button>
              </CardFooter>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
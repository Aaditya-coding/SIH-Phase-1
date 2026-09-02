"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AlertCircle, Search, Download, FileText, UploadCloud, LogOut } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function Dashboard() {
  const [claim, setClaim] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "image">("text");

  const analyzeMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_type: "text", content: text }),
      });
      if (!res.ok) throw new Error("Verification failed");
      return res.json();
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setClaim("Extracting text from image via OCR...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Calling FastAPI directly for OCR
      const res = await fetch("http://127.0.0.1:8000/ocr", {
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
    if (!analyzeMutation.data) return;
    const data = analyzeMutation.data;
    const date = new Date().toISOString();
    
    let content = format === "json" 
      ? JSON.stringify({ timestamp: date, claim, ...data }, null, 2)
      : `# Truth Intelligence Report\n**Claim:** ${claim}\n**Verdict:** ${data.verdict}\n\n## Reason\n${data.reason}`;

    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `report_${date}.${format}`;
    a.click();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto grid gap-6 md:grid-cols-12">
      <div className="md:col-span-12 flex justify-between items-center mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Intelligence Node</h2>
          <p className="text-muted-foreground">Automated Fake News Detection Engine</p>
        </div>
        <UserButton  />
      </div>

      <div className="md:col-span-5 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Submit Claim</CardTitle>
            <CardDescription>Enter text or upload a screenshot.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2 bg-slate-100 p-1 rounded-md">
              <Button variant={inputMode === "text" ? "default" : "ghost"} className="w-1/2" onClick={() => setInputMode("text")}>Direct Text</Button>
              <Button variant={inputMode === "image" ? "default" : "ghost"} className="w-1/2" onClick={() => setInputMode("image")}>Screenshot OCR</Button>
            </div>
            {inputMode === "image" && (
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <Input type="file" accept=".jpg,.jpeg,.png" className="w-full" onChange={handleImageUpload} />
              </div>
            )}
            <Textarea placeholder="Enter claim..." value={claim} onChange={(e) => setClaim(e.target.value)} className="min-h-[150px]" />
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => analyzeMutation.mutate(claim)} disabled={!claim || analyzeMutation.isPending}>
              {analyzeMutation.isPending ? "Running Pipeline..." : "Verify Fact"} <Search className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="md:col-span-7">
        {!analyzeMutation.data && !analyzeMutation.isPending && (
          <div className="h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground p-12 min-h-[400px]">
            <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
            <p>Awaiting claim submission.</p>
          </div>
        )}

        {analyzeMutation.data && (
          <div className="space-y-6">
            <Card className={analyzeMutation.data.verdict === "SUPPORTED" ? "border-green-500" : "border-red-500"}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm font-medium text-muted-foreground">VERDICT</CardTitle>
                    <h3 className="text-3xl font-bold mt-1">{analyzeMutation.data.verdict}</h3>
                  </div>
                  <div className="text-right">
                    <CardTitle className="text-sm font-medium text-muted-foreground">CONFIDENCE</CardTitle>
                    <h3 className="text-3xl font-bold mt-1">{Math.round(analyzeMutation.data.confidence * 100)}%</h3>
                  </div>
                </div>
              </CardHeader>
              <CardContent><p className="text-sm mt-4">{analyzeMutation.data.reason}</p></CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Retrieved Evidence</CardTitle></CardHeader>
              <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
                {analyzeMutation.data.evidence.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg bg-slate-50 border">
                    <span className="text-xs font-bold bg-slate-200 px-2 py-1 rounded">{item.source}</span>
                    <a href={item.url} target="_blank" className="font-medium text-blue-600 block mt-2">{item.title}</a>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.snippet}</p>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="bg-slate-50 border-t p-4 flex gap-4">
                <Button variant="outline" className="w-full" onClick={() => downloadReport("json")}><FileText className="mr-2 h-4 w-4" /> JSON</Button>
                <Button variant="outline" className="w-full" onClick={() => downloadReport("md")}><Download className="mr-2 h-4 w-4" /> Markdown</Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
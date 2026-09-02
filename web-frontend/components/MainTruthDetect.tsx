"use client";

import React, { useState } from "react";

export default function MainTruthDetector() {
  const [inputMode, setInputMode] = useState<"text" | "image">("text");
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!claim.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(data.verdict || "VERDICT: INSUFFICIENT_EVIDENCE");
      } else {
        setResult("VERDICT: INSUFFICIENT_EVIDENCE");
      }
    } catch (error) {
      setResult("VERDICT: INSUFFICIENT_EVIDENCE (Backend offline)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-sm border border-gray-100 mt-4">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Truth Intelligence
        </h1>
        <p className="text-gray-500 font-medium text-lg mt-1">
          AI-Powered Misinformation & Fake News Verification
        </p>
      </div>

      {/* Input Mode Switcher */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Choose Input Mode:
        </label>
        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-2 cursor-pointer text-sm font-medium text-gray-700">
            <input
              type="radio"
              name="inputMode"
              checked={inputMode === "text"}
              onChange={() => setInputMode("text")}
              className="text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span>Direct Text Input</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer text-sm font-medium text-gray-700">
            <input
              type="radio"
              name="inputMode"
              checked={inputMode === "image"}
              onChange={() => setInputMode("image")}
              className="text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span>Upload Image / Screenshot</span>
          </label>
        </div>
      </div>

      {/* Claim Input Box */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Enter suspicious statement or news claim:
        </label>
        <textarea
          rows={4}
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder="Government has launched a monthly relief fund program..."
          className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 font-mono text-sm"
        />
      </div>

      <button
        onClick={handleVerify}
        disabled={loading}
        className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all shadow-sm"
      >
        {loading ? "Verifying Claim..." : "Verify Claim"}
      </button>

      {/* Verification Output */}
      {result && (
        <div className="mt-8 p-6 bg-slate-900 text-white rounded-xl border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1">
            Analysis Result
          </span>
          <h3 className="text-xl font-bold font-mono tracking-wide text-emerald-400">
            {result}
          </h3>
        </div>
      )}
    </div>
  );
}
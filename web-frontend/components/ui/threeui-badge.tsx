"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

/**
 * ThreeUI Glassmorphism Badge Component
 * Implemented from canonical ThreeUI glassmorphism-cta source (SHA-256 b535a5f6e778924906fa1625cf610841b847d52c17487dad83215dd5921a3863)
 * Features revolving border beam highlight, backdrop blur, and glowing shadow.
 */
export function ThreeUIBadge({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses =
    size === "sm"
      ? "w-8 h-8"
      : size === "lg"
      ? "w-11 h-11"
      : "w-9 h-9";

  const iconSizes =
    size === "sm"
      ? "w-4 h-4"
      : size === "lg"
      ? "w-5 h-5"
      : "w-4.5 h-4.5";

  return (
    <div
      className={`group isolate inline-flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_6px_rgba(0,240,255,0.4)] rounded-full relative shadow-[0_4px_25px_rgba(99,102,241,0.35)] ${sizeClasses} ${className}`}
      style={
        {
          "--spread": "90deg",
          "--shimmer-color": "rgba(0, 240, 255, 0.8)",
          "--radius": "9999px",
          "--speed": "4s",
          "--cut": "1px",
          "--bg": "rgba(28, 28, 40, 0.6)",
        } as React.CSSProperties
      }
    >
      {/* Rotating conical shimmer gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-[-200%] w-[400%] h-[400%] animate-[spin_4s_linear_infinite]">
          <div className="absolute inset-0 [background:conic-gradient(from_225deg,transparent_0,var(--shimmer-color)_90deg,transparent_90deg)]" />
        </div>
      </div>

      {/* Glass backdrop blur layer */}
      <div className="absolute rounded-full bg-[#141420]/80 inset-[1px] backdrop-blur-md" />

      {/* Secondary revolving beam highlight */}
      <div
        className="absolute rounded-full pointer-events-none opacity-60"
        style={{
          width: "200%",
          height: "200%",
          background:
            "linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.4), rgba(129, 140, 248, 0.4), transparent)",
          animation: "borderBeamRotation 4s infinite linear",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Glowing Inner Shield Icon */}
      <div className="relative z-10 flex items-center justify-center text-white">
        <ShieldCheck className={`${iconSizes} text-cyan-300 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]`} />
      </div>

      <style jsx>{`
        @keyframes borderBeamRotation {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * ThreeUI Glassmorphism User Button Container (for Request 8)
 * Encapsulates the user profile image inside a revolving-beam glassmorphism CTA
 */
export function ThreeUIProfileButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`group isolate inline-flex items-center gap-2.5 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_6px_rgba(0,240,255,0.3)] rounded-full relative shadow-[0_4px_20px_rgba(0,0,0,0.5)] px-2 py-1 bg-[#1C1C28]/85 border border-[#2D2D3F]/80 backdrop-blur-xl ${className}`}
      style={
        {
          "--spread": "90deg",
          "--shimmer-color": "rgba(0, 240, 255, 0.5)",
          "--radius": "9999px",
          "--speed": "4s",
          "--cut": "1px",
        } as React.CSSProperties
      }
    >
      {/* Revolving border beam */}
      <div
        className="absolute pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity"
        style={{
          width: "250%",
          height: "250%",
          background:
            "linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.4), rgba(129, 140, 248, 0.4), transparent)",
          animation: "borderBeamRotation 4s infinite linear",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Inner surface */}
      <div className="absolute inset-[1px] rounded-full bg-[#141420]/80 backdrop-blur-md pointer-events-none" />

      {/* Content (Profile image & Clerk trigger) */}
      <div className="relative z-10 flex items-center gap-2">
        <span className="text-xs font-mono font-medium text-slate-300 pl-2 hidden sm:inline-block">
          Account
        </span>
        {children}
      </div>

      <style jsx>{`
        @keyframes borderBeamRotation {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

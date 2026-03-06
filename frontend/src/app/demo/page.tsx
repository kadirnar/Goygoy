"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import VoiceChat from "@/components/VoiceChat";

export default function DemoPage() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-background grid-bg">
      {/* Fullscreen voice chat */}
      <VoiceChat />

      {/* Back button */}
      <div className="absolute top-5 left-5 z-50">
        <Button variant="ghost" size="sm" asChild className="gap-2 glass">
          <Link href="/">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back
          </Link>
        </Button>
      </div>
    </div>
  );
}

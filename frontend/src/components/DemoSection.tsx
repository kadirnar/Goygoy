"use client";

import { useState, useEffect } from "react";
import { useInView } from "@/hooks/useInView";

const BOOT_SEQUENCE = [
  "3D Avatar loaded",
  "AI engine connected",
  "Expressions engine ready",
  "Voice pipeline active",
];

export default function DemoSection() {
  const { ref, inView } = useInView();
  const [bootStep, setBootStep] = useState(0);
  const [booting, setBooting] = useState(false);

  useEffect(() => {
    if (!inView || booting) return;
    setBooting(true);
    const interval = setInterval(() => {
      setBootStep((prev) => {
        if (prev >= BOOT_SEQUENCE.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [inView, booting]);

  return (
    <section id="demo" className="relative py-28 overflow-hidden">
      <div ref={ref} className="max-w-5xl mx-auto px-6">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <span className="text-xs font-mono text-primary tracking-wider uppercase font-bold">
              TRY IT NOW
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Ready to Meet Your{" "}
            <span className="neon-text">AI Companion</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Talk face-to-face, explore real emotions, and see why 3D AI avatars make text-based chatbots feel prehistoric. No credit card required.
          </p>
        </div>

        {/* Demo container */}
        <div className={`max-w-3xl mx-auto transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "300ms" }}>
          <div className="glass-card overflow-hidden">
            {/* Boot sequence header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-xs font-mono font-bold neon-text">AVATAR</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">System Boot</div>
                  <div className="text-xs text-muted-foreground font-mono">Initializing components...</div>
                </div>
              </div>

              <div className="space-y-2">
                {BOOT_SEQUENCE.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 transition-all duration-500 ${
                      i <= bootStep && booting ? "opacity-100" : "opacity-20"
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      i <= bootStep && booting ? "bg-green-400" : "bg-muted-foreground/30"
                    }`} />
                    <span className="text-xs font-mono text-muted-foreground">{step}</span>
                    {i <= bootStep && booting && (
                      <svg className="w-3 h-3 text-green-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Demo area */}
            <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-32 h-32 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-6 relative">
                <svg className="w-16 h-16 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                {booting && bootStep >= BOOT_SEQUENCE.length - 1 && (
                  <div className="absolute -inset-2 rounded-full border border-primary/30 animate-pulse" />
                )}
              </div>

              <p className="text-muted-foreground text-sm mb-6 text-center">
                Sign in required to access the free demo
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button className="btn-primary text-sm px-6 py-3">
                  Sign In to Launch Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

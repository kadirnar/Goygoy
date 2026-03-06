"use client";

import { useInView } from "@/hooks/useInView";

const OLD_WAY_ITEMS = [
  "Staring at a white screen with walls of text",
  "No face, no body language, no emotion \u2014 just words",
  "Copy-paste responses that feel robotic and lifeless",
  "Zero personality \u2014 every AI feels exactly the same",
  "Type and wait... type and wait... type and wait",
  "No voice, no real-time interaction, no presence",
  "Feels like talking to a search engine, not a being",
];

const NEW_WAY_ITEMS = [
  "A real 3D VRoid avatar that looks at you and reacts",
  "Dynamic facial expressions \u2014 smiles, surprise, anger, thinking",
  "Real-time voice conversation \u2014 just talk naturally",
  "Unique personality engine with emotional intelligence",
  "Instant responses with facial reactions and body language",
  "Screen sharing \u2014 your AI can SEE what you are working on",
  "Feels like talking to a real companion, not a tool",
];

const ADVANTAGES = [
  { stat: "10x", title: "More Engaging", desc: "Users spend 10x longer in conversation vs. text-only AI chats" },
  { stat: "3D", title: "Real Presence", desc: "A full VRoid body with animations, not an avatar circle with initials" },
  { stat: "Voice", title: "Natural Chat", desc: "Speak and get a voiced reply in real-time, with matching expressions" },
  { stat: "New", title: "Entire Category", desc: "This is not an upgrade to chatbots. It is an entirely new way to interact with AI." },
];

export default function WhySection() {
  const { ref, inView } = useInView();

  return (
    <section id="why-better" className="relative py-28 overflow-hidden">
      <div ref={ref} className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className={`text-center mb-20 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-6">
            <span className="text-xs font-mono text-yellow-400 tracking-wider uppercase font-bold">
              The Future is Here
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Why Talk to a{" "}
            <span className="text-red-400">Text Box</span>
            <br />
            When You Can Talk to a{" "}
            <span className="neon-text">Living Avatar</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            ChatGPT, Claude, Gemini &mdash; they are all just text in a box. No face, no voice, no emotion. Quantum VRM changes everything.
          </p>
        </div>

        {/* Old Way vs New Way */}
        <div className={`grid md:grid-cols-2 gap-8 mb-20 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "200ms" }}>
          {/* Old Way */}
          <div className="glass-card p-8 border-red-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/60 via-red-500/20 to-transparent" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <span className="text-[9px] font-mono text-red-400/80 tracking-widest uppercase block">THE OLD WAY</span>
                <span className="text-sm font-semibold text-foreground">Traditional Text-Based AI</span>
              </div>
            </div>

            {/* Mock chat */}
            <div className="bg-background/50 rounded-xl p-4 mb-6 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-[9px] font-bold text-muted-foreground">AI</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">Generic ChatBot</span>
                <span className="ml-auto text-[10px] text-muted-foreground/50">Text-only interface</span>
              </div>
              <div className="space-y-2.5">
                <div className="bg-muted/30 rounded-lg p-2.5 max-w-[85%]">
                  <p className="text-xs text-muted-foreground">Hello! I am an AI assistant. How can I help you today?</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-2.5 max-w-[75%] ml-auto rounded-tr-none">
                  <p className="text-xs text-primary">Can you explain this code?</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-2.5 max-w-[85%]">
                  <p className="text-xs text-muted-foreground">Sure! Here is a wall of text with no expression, no feeling, just... words on a screen.</p>
                </div>
              </div>
            </div>

            <ul className="space-y-3">
              {OLD_WAY_ITEMS.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-red-400/50">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* New Way */}
          <div className="glass-card p-8 border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <span className="text-[9px] font-mono neon-text tracking-widest uppercase block">THE QUANTUM WAY</span>
                <span className="text-sm font-semibold text-foreground">3D VRoid Real-Time AI</span>
              </div>
            </div>

            {/* Avatar preview */}
            <div className="bg-background/50 rounded-xl p-4 mb-6 border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">3D VRoid Avatar</span>
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-primary px-1.5 py-0.5 rounded bg-primary/10">Voice Active</span>
                    <span className="text-[10px] font-mono text-green-400/80 px-1.5 py-0.5 rounded bg-green-500/10">Expressions ON</span>
                  </div>
                </div>
              </div>
            </div>

            <ul className="space-y-3">
              {NEW_WAY_ITEMS.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-green-400/80">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-green-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Advantage stats */}
        <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "400ms" }}>
          {ADVANTAGES.map((adv, i) => (
            <div key={i} className="glass-card p-6 text-center group">
              <div className="text-3xl font-extrabold neon-text mb-2">{adv.stat}</div>
              <h3 className="text-foreground font-semibold mb-2">{adv.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{adv.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

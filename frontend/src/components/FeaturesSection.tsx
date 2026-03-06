"use client";

import { useInView } from "@/hooks/useInView";

const FEATURES = [
  {
    title: "Neural Persona Engine",
    desc: "Dynamic personality system with memory core. Your avatar remembers past conversations and adapts responses with emotional intelligence.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
      </svg>
    ),
  },
  {
    title: "Real-Time Voice Chat",
    desc: "Natural voice conversation with instant response. Speak naturally and get emotionally-charged, real replies in real time.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
      </svg>
    ),
  },
  {
    title: "Screen Analysis",
    desc: "Share your screen and let the AI analyze what you are working on. Get contextual help, suggestions, and real-time feedback.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a9 9 0 1 1-18 0V5.25" />
      </svg>
    ),
  },
  {
    title: "Advanced Expressions",
    desc: "Dynamic expressions with variable duration. From micro-expressions to lingering moods, the avatar feels genuinely alive.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
      </svg>
    ),
  },
  {
    title: "Safety Pipeline",
    desc: "Built-in behavioral analysis and safety reporting. Detects threats, captures evidence, and enables fast moderation.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    title: "Optimized Performance",
    desc: "Smart caching via IndexedDB, aggressive garbage collection, and code splitting. Smooth experience even on mid-range hardware.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
  },
];

const FEATURE_IMAGES = [
  { label: "Voice Chat Interface", desc: "Speak naturally, hear real responses" },
  { label: "Screen Analysis", desc: "Your AI sees what you see" },
  { label: "Expression Engine", desc: "Real emotions, real reactions" },
];

export default function FeaturesSection() {
  const { ref, inView } = useInView();

  return (
    <section id="features" className="relative py-28 overflow-hidden">
      <div ref={ref} className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <span className="text-xs font-mono text-primary tracking-wider uppercase font-bold">
              Core Features
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Powered by{" "}
            <span className="neon-text">Cutting-Edge AI</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            Every feature is engineered for an immersive, emotionally intelligent experience that blurs the line between digital and real.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`glass-card p-6 group transition-all duration-700 hover:-translate-y-1 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: inView ? `${200 + i * 100}ms` : "0ms" }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-neon">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Feature image cards */}
        <div className={`grid md:grid-cols-3 gap-6 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "800ms" }}>
          {FEATURE_IMAGES.map((img, i) => (
            <div key={i} className="glass-card overflow-hidden group">
              <div className="h-48 bg-gradient-to-b from-primary/5 to-card flex items-center justify-center relative">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>
              <div className="p-5">
                <h4 className="text-sm font-semibold text-foreground mb-1">{img.label}</h4>
                <p className="text-xs text-muted-foreground">{img.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

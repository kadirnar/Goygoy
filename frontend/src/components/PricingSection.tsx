"use client";

import { useInView } from "@/hooks/useInView";

const PLANS = [
  {
    tier: "FREE TIER",
    name: "Standard",
    subtitle: "7-day free trial included",
    price: "Free",
    priceNote: "/forever",
    cta: "Start Free Trial",
    ctaClass: "btn-secondary",
    features: [
      { text: "7-day free trial", included: true },
      { text: "10-minute real-time voice conversation", included: true },
      { text: "Basic avatar animations", included: true },
      { text: "Standard response speed", included: true },
      { text: "Text-based interaction", included: true },
      { text: "Memory across sessions", included: false },
      { text: "Screen analysis / camera", included: false },
      { text: "Custom persona creation", included: false },
      { text: "Upload your own VRM model", included: false },
      { text: "Community support", included: true },
    ],
    popular: false,
  },
  {
    tier: "PRO ACCESS",
    name: "Pro",
    subtitle: "Best value for regular users",
    price: "$4.99",
    priceNote: "/month",
    cta: "Upgrade to Pro",
    ctaClass: "btn-primary",
    badge: "POPULAR",
    features: [
      { text: "180-minute daily voice chat limit", included: true },
      { text: "Full animation library unlocked", included: true },
      { text: "Real-time voice conversations", included: true },
      { text: "Screen sharing & AI analysis (limited time)", included: true },
      { text: "Camera access for AI vision (limited time)", included: true },
      { text: "Priority response speed", included: true },
      { text: "Emotional intelligence engine", included: true },
      { text: "Custom persona creation", included: true },
      { text: "Memory across sessions", included: true },
      { text: "Upload your own VRM model", included: true },
    ],
    popular: true,
  },
  {
    tier: "PLUS ACCESS",
    name: "Plus",
    subtitle: "Unlimited everything, no restrictions",
    price: "$9.99",
    priceNote: "/month",
    cta: "Go Plus",
    ctaClass: "btn-secondary",
    badge: "ULTIMATE",
    features: [
      { text: "Unlimited voice chat - no daily limit", included: true },
      { text: "Custom persona creation", included: true },
      { text: "Memory across sessions - AI remembers you", included: true },
      { text: "Upload your own VRM model", included: true },
      { text: "Unlimited screen analysis & camera access", included: true },
      { text: "Full animation & expression library", included: true },
      { text: "Priority response speed", included: true },
      { text: "Emotional intelligence engine", included: true },
      { text: "No feature restrictions whatsoever", included: true },
      { text: "Early access to new features", included: true },
    ],
    popular: false,
  },
];

export default function PricingSection() {
  const { ref, inView } = useInView();

  return (
    <section id="pricing" className="relative py-28 overflow-hidden">
      <div ref={ref} className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <span className="text-xs font-mono text-primary tracking-wider uppercase font-bold">
              Pricing Plans
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Choose Your{" "}
            <span className="neon-text">Access Level</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Start free and upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className={`glass-card p-8 relative transition-all duration-700 ${
                plan.popular ? "border-primary/40 md:scale-[1.03] md:-my-2" : ""
              } ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: inView ? `${200 + i * 150}ms` : "0ms" }}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    plan.popular
                      ? "bg-primary text-primary-foreground"
                      : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  }`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Tier label */}
              <span className="text-[10px] font-mono text-primary tracking-widest uppercase block mb-2">
                {plan.tier}
              </span>

              <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{plan.subtitle}</p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground ml-1">{plan.priceNote}</span>
              </div>

              {/* CTA */}
              <button className={`${plan.ctaClass} w-full mb-8 text-sm`}>
                {plan.cta}
              </button>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm">
                    {f.included ? (
                      <svg className="w-4 h-4 mt-0.5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={f.included ? "text-muted-foreground" : "text-muted-foreground/50 line-through"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer notes */}
        <div className={`text-center mt-10 space-y-2 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "600ms" }}>
          <p className="text-sm text-muted-foreground">
            All plans include access to the base VRoid 3D AI avatar.
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-semibold">Pro</span> unlocks screen analysis and extended voice chat.{" "}
            <span className="text-yellow-400 font-semibold">Plus</span> unlocks custom personas, memory, own model uploads, and removes all limits.
          </p>
          <p className="text-xs text-muted-foreground/50 mt-4">
            7-day free trial included
          </p>
        </div>
      </div>
    </section>
  );
}

"use client";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left — Copy */}
          <div className="flex-1 text-center lg:text-left">
            {/* NEW badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-xs font-mono text-red-400 tracking-wider uppercase font-bold">
                NEW - Never Seen Before
              </span>
            </div>

            {/* Subtitle pill */}
            <div className="block">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border mb-8">
                <span className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
                  Next-Gen 3D AI Avatar System
                </span>
              </div>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6 text-balance">
              <span className="text-foreground">Not Just Another </span>
              <span className="neon-text">Chatbot.</span>
              <br />
              <span className="text-foreground">A Living </span>
              <span className="neon-text">Companion.</span>
            </h1>

            {/* Description */}
            <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed mb-4">
              Forget boring text boxes. Talk face-to-face with a 3D VRoid avatar that{" "}
              <span className="text-foreground font-semibold">sees you, hears you, understands you</span>
              {" "}&mdash; and responds with real emotions, real voice, and real-time intelligence.
            </p>

            <p className="text-muted-foreground/70 text-sm max-w-xl mx-auto lg:mx-0 leading-relaxed mb-10">
              This is what AI interaction was always meant to be.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button className="btn-primary w-full sm:w-auto">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
                Try Free Demo
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
              <button
                className="btn-secondary w-full sm:w-auto"
                onClick={() => document.querySelector("#why-better")?.scrollIntoView({ behavior: "smooth" })}
              >
                Why This Changes Everything
              </button>
            </div>

            <p className="text-muted-foreground/50 text-xs mt-4 text-center lg:text-left font-mono">
              Sign in required to access the free demo
            </p>
          </div>

          {/* Right — Avatar preview */}
          <div className="flex-1 relative flex justify-center">
            <div className="relative animate-float">
              {/* Glow behind */}
              <div className="absolute -inset-8 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -inset-4 bg-gradient-to-b from-primary/15 via-transparent to-[#007a8a]/10 rounded-3xl blur-2xl" />

              {/* Avatar card */}
              <div className="relative glass-card p-3 overflow-hidden rounded-2xl">
                <div className="w-full max-w-sm h-auto rounded-xl bg-card border border-border flex items-center justify-center" style={{ aspectRatio: "3/4" }}>
                  <div className="text-center p-8">
                    <div className="w-32 h-32 mx-auto rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-4">
                      <svg className="w-16 h-16 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                    </div>
                    <p className="text-sm font-mono text-muted-foreground">Avatar Preview</p>
                  </div>
                </div>

                {/* Scan line effect */}
                <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                  <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-scan" />
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-3 -right-3 glass-card neon-border px-3 py-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-mono text-foreground">LIVE 3D</span>
              </div>

              <div className="absolute -bottom-3 -left-3 glass-card neon-border px-3 py-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-mono neon-text">AI Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-muted-foreground/40 text-[10px] font-mono uppercase tracking-widest">Scroll</span>
        <svg className="w-4 h-4 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
        </svg>
      </div>

      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#007a8a]/5 rounded-full blur-3xl" />
      </div>
    </section>
  );
}

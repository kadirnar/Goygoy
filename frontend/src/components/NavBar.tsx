"use client";

import { useState, useCallback, useSyncExternalStore } from "react";

const NAV_LINKS = [
  { label: "Why Us", href: "#why-better" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Demo", href: "#demo" },
];

function useScrolled() {
  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener("scroll", cb, { passive: true });
    return () => window.removeEventListener("scroll", cb);
  }, []);
  const getSnapshot = useCallback(() => window.scrollY > 20, []);
  const getServerSnapshot = useCallback(() => false, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function NavBar() {
  const scrolled = useScrolled();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleAnchorClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center"
        >
          <span className="text-foreground text-lg font-extrabold tracking-tight">
            Quantum<span className="neon-text">VRM</span>
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleAnchorClick(link.href)}
              className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors duration-200"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">3D VRoid Model Active</span>
          </div>
          <button className="btn-primary text-xs px-5 py-2.5">
            Try Free Demo
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border px-6 py-4">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleAnchorClick(link.href)}
                className="text-muted-foreground hover:text-primary text-sm font-medium py-2 transition-colors text-left"
              >
                {link.label}
              </button>
            ))}
            <div className="flex flex-col gap-2 pt-3 border-t border-border">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground">3D VRoid Model Active</span>
              </div>
              <button className="btn-primary text-xs py-2.5">
                Try Free Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

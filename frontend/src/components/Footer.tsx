"use client";

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-foreground text-lg font-extrabold tracking-tight">
              Quantum<span className="neon-text">VRM</span>
            </span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground text-center">
            &copy; 2026 Quantum VRM. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

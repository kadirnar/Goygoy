"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ThemeToggleProps {
  collapsed?: boolean;
}

export default function ThemeToggle({ collapsed }: ThemeToggleProps) {
  const { theme, mounted, toggleTheme } = useTheme();

  // Render a placeholder with the same dimensions until mounted to avoid hydration mismatch
  const icon = !mounted ? (
    <span className="w-4 h-4 flex-shrink-0" />
  ) : theme === "dark" ? (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  ) : (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  );

  const label = theme === "dark" ? "Light mode" : "Dark mode";

  const button = (
    <Button
      variant="ghost"
      size={collapsed ? "icon" : "default"}
      onClick={toggleTheme}
      className="w-full justify-start gap-2 text-foreground/60 hover:text-foreground"
    >
      {icon}
      {!collapsed && <span className="text-sm">{label}</span>}
    </Button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

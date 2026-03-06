"use client";

import { useState, useCallback } from "react";

interface CodeBlockProps {
  code: string;
  language: string;
}

// Minimal regex-based syntax highlighter — warm color theme
function highlightSyntax(code: string, language: string): string {
  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Comments
  html = html.replace(/(\/\/.*$|#.*$)/gm, '<span class="code-comment">$1</span>');

  // Strings
  html = html.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '<span class="code-string">$&</span>');

  // Keywords
  const keywords =
    language === "python"
      ? /\b(import|from|def|class|return|if|else|elif|async|await|with|as|for|in|try|except|True|False|None|print)\b/g
      : /\b(import|export|from|const|let|var|function|return|if|else|async|await|new|class|true|false|null|undefined|typeof|void)\b/g;
  html = html.replace(keywords, '<span class="code-keyword">$&</span>');

  // Numbers
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="code-number">$&</span>');

  // Functions (word followed by parenthesis)
  html = html.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="code-function">$&</span>');

  return html;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const lines = code.split("\n");
  const highlighted = highlightSyntax(code, language);
  const highlightedLines = highlighted.split("\n");

  return (
    <div className="code-block relative group rounded-xl overflow-hidden border border-border/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-foreground/[0.02]">
        <span className="text-[11px] font-mono text-muted-foreground">{language}</span>
        <button
          onClick={handleCopy}
          className="text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded"
        >
          {copied ? "copied!" : "copy"}
        </button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto p-4">
        <table className="w-full border-collapse">
          <tbody>
            {highlightedLines.map((line, i) => (
              <tr key={i} className="leading-relaxed">
                <td className="pr-4 text-right select-none text-[12px] font-mono text-muted-foreground/40 w-8">
                  {i + 1}
                </td>
                <td
                  className="text-[13px] font-mono whitespace-pre"
                  dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

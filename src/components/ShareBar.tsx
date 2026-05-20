"use client";

import { useState } from "react";

interface ShareBarProps {
  slug: string;
  pathTitle: string;
}

export default function ShareBar({ slug, pathTitle }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/path/${slug}`
      : `/path/${slug}`;

  const text = `Check out my personalized dev learning path: ${pathTitle}`;

  const twitterHref = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail
    }
  }

  const btnBase: React.CSSProperties = {
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-jetbrains-var)",
    fontSize: 12,
    padding: "6px 14px",
    borderRadius: 6,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "opacity 150ms ease",
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span
        style={{
          color: "var(--text-secondary)",
          fontFamily: "var(--font-jetbrains-var)",
          fontSize: 12,
        }}
      >
        Share:
      </span>

      <a href={twitterHref} target="_blank" rel="noopener noreferrer" style={btnBase}
        className="hover:opacity-75">
        𝕏 Twitter
      </a>

      <a href={linkedinHref} target="_blank" rel="noopener noreferrer" style={btnBase}
        className="hover:opacity-75">
        in LinkedIn
      </a>

      <button
        onClick={handleCopy}
        style={{
          ...btnBase,
          backgroundColor: copied ? "var(--accent-green)" : "var(--bg-elevated)",
          border: `1px solid ${copied ? "var(--accent-green)" : "var(--border)"}`,
          color: copied ? "var(--bg-base)" : "var(--text-primary)",
        }}
        className="hover:opacity-75"
      >
        {copied ? "✓ Copied!" : "⎘ Copy Link"}
      </button>
    </div>
  );
}

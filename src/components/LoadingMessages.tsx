"use client";

import { useState, useEffect } from "react";

const MESSAGES = [
  "Analyzing your profile...",
  "Reading your saved articles...",
  "Mapping your knowledge gaps...",
  "Curating your path with AI...",
  "Almost there...",
];

export default function LoadingMessages() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      const t = setTimeout(() => {
        setIndex((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 350);
      return () => clearTimeout(t);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{ minHeight: 28, display: "flex", alignItems: "center", gap: 4 }}
    >
      <span
        style={{
          color: "var(--accent-primary)",
          fontFamily: "var(--font-jetbrains-var)",
          fontSize: 14,
          opacity: visible ? 1 : 0,
          transition: "opacity 350ms ease",
        }}
      >
        {MESSAGES[index]}
      </span>
      <span
        style={{ color: "var(--accent-primary)", fontSize: 14 }}
        className="cursor-blink"
      >
        _
      </span>
    </div>
  );
}

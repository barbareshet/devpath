"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { BackgroundAnswers } from "@/types";

const BACKGROUND_STORAGE_KEY = "devpath:background";

const BG_QUESTIONS = [
  {
    key: "experience" as const,
    label: "How long have you been coding?",
    options: ["< 1 year", "1–3 years", "3–7 years", "7+ years"],
  },
  {
    key: "role" as const,
    label: "What's your primary role?",
    options: ["Frontend", "Backend", "Full-stack", "DevOps / SRE", "Data / ML / AI", "Other"],
  },
  {
    key: "goal" as const,
    label: "What's driving your learning right now?",
    options: [
      "Interview prep / job search",
      "Growing at my current job",
      "Building a side project",
      "Learning for fun",
    ],
  },
  {
    key: "learningStyle" as const,
    label: "How do you learn best?",
    options: [
      "Step-by-step structured guides",
      "Deep dives and technical articles",
      "Tutorials I can code along with",
      "Understanding the 'why' behind things",
    ],
  },
];

export default function ProfilePage() {
  const [background, setBackground] = useState<Partial<BackgroundAnswers>>({});
  const [challenge, setChallenge] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(BACKGROUND_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BackgroundAnswers;
      setBackground(parsed);
      setChallenge(parsed.challenge ?? "");
    }
  }, []);

  function handleSave() {
    const unanswered = BG_QUESTIONS.find((q) => !background[q.key]);
    if (unanswered) {
      setError(`Please answer: "${unanswered.label}"`);
      return;
    }
    const full: BackgroundAnswers = {
      experience: background.experience!,
      role: background.role!,
      goal: background.goal!,
      learningStyle: background.learningStyle!,
      challenge: challenge.trim() || undefined,
    };
    localStorage.setItem(BACKGROUND_STORAGE_KEY, JSON.stringify(full));
    setError("");
    setSaved(true);
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    color: "var(--text-primary)",
    fontFamily: "var(--font-jetbrains-var)",
    fontSize: 13,
    padding: "10px 14px",
    width: "100%",
    outline: "none",
  };

  return (
    <>
      <Navbar />
      <main
        className="flex justify-center px-6 py-16"
        style={{ paddingTop: "calc(56px + 48px)", minHeight: "100vh", backgroundColor: "var(--bg-base)" }}
      >
        <div style={{ width: "100%", maxWidth: 520 }}>
          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <h1
              style={{
                fontFamily: "var(--font-syne-var)",
                color: "var(--text-primary)",
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                marginBottom: 8,
              }}
            >
              Your Profile
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-jetbrains-var)",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              These answers help the AI tailor every learning path to where you are right now.
              Saved locally in your browser — update anytime.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {BG_QUESTIONS.map((q) => (
              <div key={q.key}>
                <p
                  style={{
                    fontFamily: "var(--font-syne-var)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 10,
                  }}
                >
                  {q.label}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {q.options.map((opt) => {
                    const isSelected = background[q.key] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setBackground((prev) => ({ ...prev, [q.key]: opt }));
                          setSaved(false);
                        }}
                        style={{
                          textAlign: "left",
                          backgroundColor: isSelected ? "rgba(139,92,246,0.12)" : "var(--bg-surface)",
                          border: `1px solid ${isSelected ? "var(--accent-primary)" : "var(--border)"}`,
                          borderRadius: 6,
                          color: isSelected ? "var(--accent-primary)" : "var(--text-secondary)",
                          fontFamily: "var(--font-jetbrains-var)",
                          fontSize: 13,
                          padding: "9px 14px",
                          cursor: "pointer",
                          transition: "border-color 150ms ease, color 150ms ease, background 150ms ease",
                        }}
                      >
                        {isSelected && <span style={{ marginRight: 8 }}>✓</span>}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Challenge field */}
            <div>
              <p
                style={{
                  fontFamily: "var(--font-syne-var)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                What are you struggling with most?{" "}
                <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: 12 }}>
                  (optional)
                </span>
              </p>
              <textarea
                placeholder="e.g. I keep getting lost in async patterns, or I struggle with system design interviews..."
                value={challenge}
                onChange={(e) => { setChallenge(e.target.value); setSaved(false); }}
                rows={3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>

            {/* Error */}
            {error && (
              <p
                style={{
                  color: "#F87171",
                  fontFamily: "var(--font-jetbrains-var)",
                  fontSize: 12,
                  backgroundColor: "rgba(248, 113, 113, 0.08)",
                  border: "1px solid rgba(248, 113, 113, 0.2)",
                  padding: "8px 12px",
                  borderRadius: 6,
                }}
              >
                {error}
              </p>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              style={{
                background: saved ? "var(--bg-elevated)" : "var(--accent-primary)",
                color: saved ? "var(--accent-primary)" : "#fff",
                fontFamily: "var(--font-jetbrains-var)",
                fontSize: 14,
                fontWeight: 500,
                padding: "12px 24px",
                borderRadius: 9999,
                border: saved ? "1px solid var(--accent-primary)" : "none",
                cursor: "pointer",
                width: "100%",
                transition: "background 200ms ease, color 200ms ease",
              }}
              className="hover:opacity-90"
            >
              {saved ? "✓ Profile saved" : "Save profile"}
            </button>

            {/* CTA after saving */}
            {saved && (
              <Link
                href="/generate"
                style={{
                  display: "block",
                  textAlign: "center",
                  background: "var(--accent-primary)",
                  color: "#fff",
                  fontFamily: "var(--font-jetbrains-var)",
                  fontSize: 14,
                  fontWeight: 500,
                  padding: "12px 24px",
                  borderRadius: 9999,
                  textDecoration: "none",
                  transition: "opacity 150ms ease",
                }}
                className="hover:opacity-90"
              >
                Generate your path →
              </Link>
            )}
          </div>
        </div>

      </main>
    </>
  );
}

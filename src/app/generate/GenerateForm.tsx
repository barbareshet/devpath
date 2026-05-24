"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import LoadingMessages from "@/components/LoadingMessages";
import { runGenerate } from "@/app/actions/runGenerate";
import { savePath, addToPathIndex, encodePathForUrl } from "@/lib/storage";
import type { BackgroundAnswers } from "@/types";

const PAT_STORAGE_KEY = "devpath:pat";
const OPENAI_KEY_STORAGE_KEY = "devpath:openai-key";
const MAX_TOPICS = 3;

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

const SUGGESTED_TOPICS = [
  "React",
  "TypeScript",
  "Node.js",
  "System Design",
  "Kubernetes",
  "Docker",
  "DevOps",
  "Next.js",
  "Rust",
  "GraphQL",
  "AWS",
  "AI / LLMs",
  "Performance",
  "Security",
  "Python",
  "Other",
];

interface GenerateFormProps {
  defaultToken?: string;
  defaultOpenAIKey?: string;
  defaultTopic?: string;
}

export default function GenerateForm({
  defaultToken = "",
  defaultOpenAIKey = "",
  defaultTopic = "",
}: GenerateFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [token, setToken] = useState(defaultToken);
  const [openaiKey, setOpenaiKey] = useState(defaultOpenAIKey);
  const [selected, setSelected] = useState<string[]>(
    defaultTopic ? [defaultTopic] : []
  );
  const [customTopic, setCustomTopic] = useState("");
  const [background, setBackground] = useState<Partial<BackgroundAnswers>>({});
  const [challenge, setChallenge] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const customInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedPat = localStorage.getItem(PAT_STORAGE_KEY);
    if (savedPat) setToken(savedPat);
    const savedOpenAI = localStorage.getItem(OPENAI_KEY_STORAGE_KEY);
    if (savedOpenAI) setOpenaiKey(savedOpenAI);
  }, []);

  // Focus custom input when "Other" is selected
  useEffect(() => {
    if (selected.includes("Other")) {
      customInputRef.current?.focus();
    }
  }, [selected]);

  function toggleTopic(t: string) {
    setSelected((prev) => {
      if (prev.includes(t)) {
        // Deselect
        if (t === "Other") setCustomTopic("");
        return prev.filter((x) => x !== t);
      }
      // Select — enforce max
      if (prev.length >= MAX_TOPICS) return prev;
      return [...prev, t];
    });
  }

  function buildTopicString(): string {
    const parts = selected
      .map((t) => (t === "Other" ? customTopic.trim() : t))
      .filter(Boolean);
    return parts.join(", ");
  }

  function handleNextStep() {
    if (!token.trim()) { setError("Please enter your daily.dev API token."); return; }
    if (!openaiKey.trim()) { setError("Please enter your OpenAI API key."); return; }
    if (selected.length === 0) { setError("Please select at least one focus topic."); return; }
    if (selected.includes("Other") && !customTopic.trim()) { setError("Please describe your custom topic."); return; }
    setError("");
    setStep(2);
  }

  async function handleGenerate() {
    const unanswered = BG_QUESTIONS.find((q) => !background[q.key]);
    if (unanswered) {
      setError(`Please answer: "${unanswered.label}"`);
      return;
    }

    setError("");
    setLoading(true);

    const fullBackground: BackgroundAnswers = {
      experience: background.experience!,
      role: background.role!,
      goal: background.goal!,
      learningStyle: background.learningStyle!,
      challenge: challenge.trim() || undefined,
    };

    try {
      localStorage.setItem(PAT_STORAGE_KEY, token.trim());
      localStorage.setItem(OPENAI_KEY_STORAGE_KEY, openaiKey.trim());
      const topicString = buildTopicString();
      const { slug, path } = await runGenerate(
        token.trim(),
        openaiKey.trim(),
        topicString || undefined,
        fullBackground
      );
      savePath(slug, path);
      addToPathIndex({
        slug,
        pathTitle: path.pathTitle,
        createdAt: new Date().toISOString(),
        articleCount: path.stages.flatMap((s) => s.articles).length,
        stageCount: path.stages.length,
      });
      const encoded = encodePathForUrl(path);
      router.push(`/path/${slug}?d=${encoded}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setLoading(false);
    }
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

  const labelStyle: React.CSSProperties = {
    color: "var(--text-secondary)",
    fontFamily: "var(--font-jetbrains-var)",
    fontSize: 12,
    display: "block",
    marginBottom: 6,
  };

  const remaining = MAX_TOPICS - selected.length;

  const stepIndicator = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 32,
        fontFamily: "var(--font-jetbrains-var)",
        fontSize: 11,
      }}
    >
      {[1, 2].map((n) => (
        <div key={n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: step >= n ? "var(--accent-primary)" : "var(--bg-elevated)",
              border: `1px solid ${step >= n ? "var(--accent-primary)" : "var(--border)"}`,
              color: step >= n ? "#fff" : "var(--text-muted)",
              fontSize: 10,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {n}
          </span>
          <span style={{ color: step === n ? "var(--text-primary)" : "var(--text-muted)" }}>
            {n === 1 ? "Setup" : "About you"}
          </span>
          {n < 2 && (
            <span style={{ color: "var(--border)", marginLeft: 0 }}>——</span>
          )}
        </div>
      ))}
    </div>
  );

  const errorBlock = error && (
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
  );

  return (
    <div style={{ width: "100%", maxWidth: 520 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
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
          Generate Your Path
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontFamily: "var(--font-jetbrains-var)",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {step === 1
            ? "Connect your daily.dev profile and pick your focus topics."
            : "A few quick questions so the AI can tailor your path."}
        </p>
      </div>

      {stepIndicator}

      {/* ── Step 1: credentials + topics ── */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* PAT input */}
          <div>
            <label style={labelStyle}>
              daily.dev API Token{" "}
              <span style={{ color: "var(--text-muted)" }}>(required)</span>
            </label>
            <input
              type="password"
              placeholder="dda_xxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              style={inputStyle}
              autoComplete="off"
              spellCheck={false}
            />
            <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-jetbrains-var)", fontSize: 11, marginTop: 6 }}>
              Get yours at{" "}
              <a href="https://app.daily.dev/settings/api" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)" }}>
                app.daily.dev/settings/api
              </a>{" "}
              — requires Plus subscription.
            </p>
          </div>

          {/* OpenAI key */}
          <div>
            <label style={labelStyle}>
              OpenAI API Key{" "}
              <span style={{ color: "var(--text-muted)" }}>(required)</span>
            </label>
            <input
              type="password"
              placeholder="sk-..."
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              style={inputStyle}
              autoComplete="off"
              spellCheck={false}
            />
            <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-jetbrains-var)", fontSize: 11, marginTop: 6 }}>
              Get yours at{" "}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)" }}>
                platform.openai.com/api-keys
              </a>
              . Stored only in your browser.
            </p>
          </div>

          {/* Topic multi-select */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                Focus topics{" "}
                <span style={{ color: "var(--text-muted)" }}>(required, up to 3)</span>
              </label>
              {selected.length > 0 && (
                <span style={{ color: remaining === 0 ? "var(--accent-yellow)" : "var(--text-muted)", fontFamily: "var(--font-jetbrains-var)", fontSize: 11, transition: "color 150ms" }}>
                  {remaining === 0 ? "Max reached" : `${remaining} left`}
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SUGGESTED_TOPICS.map((t) => {
                const isSelected = selected.includes(t);
                const isDisabled = !isSelected && remaining === 0;
                const isOther = t === "Other";
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => toggleTopic(t)}
                    style={{
                      backgroundColor: isSelected ? (isOther ? "var(--accent-yellow)" : "var(--accent-primary)") : "var(--bg-elevated)",
                      border: `1px solid ${isSelected ? (isOther ? "var(--accent-yellow)" : "var(--accent-primary)") : "var(--border)"}`,
                      color: isSelected ? (isOther ? "var(--bg-base)" : "#fff") : isDisabled ? "var(--text-muted)" : "var(--text-secondary)",
                      fontFamily: "var(--font-jetbrains-var)",
                      fontSize: 12,
                      padding: "5px 12px",
                      borderRadius: 9999,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      opacity: isDisabled ? 0.45 : 1,
                      transition: "background 150ms ease, border-color 150ms ease, color 150ms ease",
                    }}
                  >
                    {isOther ? "✏ Other" : t}
                    {isSelected && !isOther && <span style={{ marginLeft: 5, opacity: 0.7 }}>×</span>}
                  </button>
                );
              })}
            </div>

            {selected.includes("Other") && (
              <div style={{ marginTop: 12 }}>
                <input
                  ref={customInputRef}
                  type="text"
                  placeholder="Describe your topic, e.g. WebAssembly, tRPC, edge computing..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  style={{ ...inputStyle, borderColor: "var(--accent-yellow)" }}
                />
              </div>
            )}

            {selected.length > 0 && (
              <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-jetbrains-var)", fontSize: 11, marginTop: 10 }}>
                Focused on: <span style={{ color: "var(--text-secondary)" }}>{buildTopicString() || "…"}</span>
              </p>
            )}
          </div>

          {errorBlock}

          <button
            onClick={handleNextStep}
            style={{
              background: "var(--accent-primary)",
              color: "#fff",
              fontFamily: "var(--font-jetbrains-var)",
              fontSize: 14,
              fontWeight: 500,
              padding: "12px 24px",
              borderRadius: 9999,
              border: "none",
              cursor: "pointer",
              width: "100%",
            }}
            className="hover:opacity-90"
          >
            Next: About you →
          </button>
        </div>
      )}

      {/* ── Step 2: background questions ── */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {BG_QUESTIONS.map((q) => (
            <div key={q.key}>
              <p style={{ fontFamily: "var(--font-syne-var)", color: "var(--text-primary)", fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                {q.label}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {q.options.map((opt) => {
                  const isSelected = background[q.key] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={loading}
                      onClick={() => setBackground((prev) => ({ ...prev, [q.key]: opt }))}
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

          {/* Optional free-text challenge */}
          <div>
            <p style={{ fontFamily: "var(--font-syne-var)", color: "var(--text-primary)", fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
              What are you struggling with most?{" "}
              <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: 12 }}>(optional)</span>
            </p>
            <textarea
              placeholder="e.g. I keep getting lost in async patterns, or I struggle with system design interviews..."
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              disabled={loading}
              rows={3}
              style={{
                ...inputStyle,
                resize: "vertical",
                lineHeight: 1.6,
              }}
            />
          </div>

          {errorBlock}
          {loading && <LoadingMessages />}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => { setStep(1); setError(""); }}
              disabled={loading}
              style={{
                background: "var(--bg-elevated)",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-jetbrains-var)",
                fontSize: 14,
                padding: "12px 20px",
                borderRadius: 9999,
                border: "1px solid var(--border)",
                cursor: loading ? "not-allowed" : "pointer",
                flexShrink: 0,
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{
                flex: 1,
                background: loading ? "var(--bg-elevated)" : "var(--accent-primary)",
                color: loading ? "var(--text-muted)" : "#fff",
                fontFamily: "var(--font-jetbrains-var)",
                fontSize: 14,
                fontWeight: 500,
                padding: "12px 24px",
                borderRadius: 9999,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 200ms ease",
              }}
              className={loading ? "" : "hover:opacity-90"}
            >
              {loading ? "Generating..." : "Generate My Learning Path →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

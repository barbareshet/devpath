"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import LoadingMessages from "@/components/LoadingMessages";
import { runGenerate } from "@/app/actions/runGenerate";
import { savePath, addToPathIndex } from "@/lib/storage";

const PAT_STORAGE_KEY = "devpath:pat";
const MAX_TOPICS = 3;

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
  defaultTopic?: string;
}

export default function GenerateForm({
  defaultToken = "",
  defaultTopic = "",
}: GenerateFormProps) {
  const router = useRouter();
  const [token, setToken] = useState(defaultToken);
  const [selected, setSelected] = useState<string[]>(
    defaultTopic ? [defaultTopic] : []
  );
  const [customTopic, setCustomTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const customInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(PAT_STORAGE_KEY);
    if (saved) setToken(saved);
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

  async function handleGenerate() {
    if (!token.trim()) {
      setError("Please enter your daily.dev API token.");
      return;
    }
    if (selected.includes("Other") && !customTopic.trim()) {
      setError("Please describe your custom topic.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      localStorage.setItem(PAT_STORAGE_KEY, token.trim());
      const topicString = buildTopicString();
      const { slug, path } = await runGenerate(
        token.trim(),
        topicString || undefined
      );
      savePath(slug, path);
      addToPathIndex({
        slug,
        pathTitle: path.pathTitle,
        createdAt: new Date().toISOString(),
        articleCount: path.stages.flatMap((s) => s.articles).length,
        stageCount: path.stages.length,
      });
      router.push(`/path/${slug}`);
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

  return (
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
          Enter your daily.dev API token and optionally focus on up to 3 topics.
        </p>
      </div>

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
            disabled={loading}
            style={inputStyle}
            autoComplete="off"
            spellCheck={false}
          />
          <p
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-jetbrains-var)",
              fontSize: 11,
              marginTop: 6,
            }}
          >
            Get yours at{" "}
            <a
              href="https://app.daily.dev/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent-primary)" }}
            >
              app.daily.dev/settings/api
            </a>{" "}
            — requires Plus subscription.
          </p>
        </div>

        {/* Topic multi-select */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 10,
            }}
          >
            <label style={{ ...labelStyle, marginBottom: 0 }}>
              Focus topics{" "}
              <span style={{ color: "var(--text-muted)" }}>(optional, up to 3)</span>
            </label>
            {selected.length > 0 && (
              <span
                style={{
                  color: remaining === 0 ? "var(--accent-yellow)" : "var(--text-muted)",
                  fontFamily: "var(--font-jetbrains-var)",
                  fontSize: 11,
                  transition: "color 150ms",
                }}
              >
                {remaining === 0 ? "Max reached" : `${remaining} left`}
              </span>
            )}
          </div>

          {/* Pills grid */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SUGGESTED_TOPICS.map((t) => {
              const isSelected = selected.includes(t);
              const isDisabled =
                loading || (!isSelected && remaining === 0);
              const isOther = t === "Other";

              return (
                <button
                  key={t}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => toggleTopic(t)}
                  style={{
                    backgroundColor: isSelected
                      ? isOther
                        ? "var(--accent-yellow)"
                        : "var(--accent-primary)"
                      : "var(--bg-elevated)",
                    border: `1px solid ${
                      isSelected
                        ? isOther
                          ? "var(--accent-yellow)"
                          : "var(--accent-primary)"
                        : "var(--border)"
                    }`,
                    color: isSelected
                      ? isOther
                        ? "var(--bg-base)"
                        : "#fff"
                      : isDisabled
                      ? "var(--text-muted)"
                      : "var(--text-secondary)",
                    fontFamily: "var(--font-jetbrains-var)",
                    fontSize: 12,
                    padding: "5px 12px",
                    borderRadius: 9999,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled && !isSelected ? 0.45 : 1,
                    transition:
                      "background 150ms ease, border-color 150ms ease, color 150ms ease",
                  }}
                >
                  {isOther ? "✏ Other" : t}
                  {isSelected && !isOther && (
                    <span style={{ marginLeft: 5, opacity: 0.7 }}>×</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom topic input — visible when "Other" is selected */}
          {selected.includes("Other") && (
            <div style={{ marginTop: 12 }}>
              <input
                ref={customInputRef}
                type="text"
                placeholder="Describe your topic, e.g. WebAssembly, tRPC, edge computing..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                disabled={loading}
                style={{
                  ...inputStyle,
                  borderColor: "var(--accent-yellow)",
                }}
              />
            </div>
          )}

          {/* Selected summary */}
          {selected.length > 0 && (
            <p
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-jetbrains-var)",
                fontSize: 11,
                marginTop: 10,
              }}
            >
              Generating path focused on:{" "}
              <span style={{ color: "var(--text-secondary)" }}>
                {buildTopicString() || "…"}
              </span>
            </p>
          )}
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

        {loading && <LoadingMessages />}

        {/* Submit */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
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
            width: "100%",
          }}
          className={loading ? "" : "hover:opacity-90"}
        >
          {loading ? "Generating..." : "Generate My Learning Path →"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingMessages from "@/components/LoadingMessages";
import { runGenerate } from "@/app/actions/runGenerate";
import { suggestPaths } from "@/app/actions/suggestPaths";
import { savePath, addToPathIndex, encodePathForUrl } from "@/lib/storage";
import type { BackgroundAnswers, PathSuggestion } from "@/types";

const PAT_STORAGE_KEY = "devpath:pat";
const OPENAI_KEY_STORAGE_KEY = "devpath:openai-key";
const BACKGROUND_STORAGE_KEY = "devpath:background";
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
  defaultOpenAIKey?: string;
  defaultTopic?: string;
}

export default function GenerateForm({
  defaultToken = "",
  defaultOpenAIKey = "",
  defaultTopic = "",
}: GenerateFormProps) {
  const router = useRouter();
  const [token, setToken] = useState(defaultToken);
  const [openaiKey, setOpenaiKey] = useState(defaultOpenAIKey);
  const [selected, setSelected] = useState<string[]>(
    defaultTopic ? [defaultTopic] : []
  );
  const [customTopic, setCustomTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasProfile, setHasProfile] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<PathSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState("");
  const [loadingSuggestion, setLoadingSuggestion] = useState<string | null>(null);

  useEffect(() => {
    const savedPat = localStorage.getItem(PAT_STORAGE_KEY);
    if (savedPat) setToken(savedPat);
    const savedOpenAI = localStorage.getItem(OPENAI_KEY_STORAGE_KEY);
    if (savedOpenAI) setOpenaiKey(savedOpenAI);
    setHasProfile(!!localStorage.getItem(BACKGROUND_STORAGE_KEY));
  }, []);

  useEffect(() => {
    if (selected.includes("Other")) {
      customInputRef.current?.focus();
    }
  }, [selected]);

  function toggleTopic(t: string) {
    setSelected((prev) => {
      if (prev.includes(t)) {
        if (t === "Other") setCustomTopic("");
        return prev.filter((x) => x !== t);
      }
      if (prev.length >= MAX_TOPICS) return prev;
      return [...prev, t];
    });
  }

  function buildTopicString(): string {
    return selected
      .map((t) => (t === "Other" ? customTopic.trim() : t))
      .filter(Boolean)
      .join(", ");
  }

  function loadBackground(): BackgroundAnswers | undefined {
    const raw = localStorage.getItem(BACKGROUND_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BackgroundAnswers) : undefined;
  }

  async function handleGenerate() {
    if (!token.trim()) { setError("Please enter your daily.dev API token."); return; }
    if (!openaiKey.trim()) { setError("Please enter your OpenAI API key."); return; }
    if (selected.length === 0) { setError("Please select at least one focus topic."); return; }
    if (selected.includes("Other") && !customTopic.trim()) { setError("Please describe your custom topic."); return; }

    setError("");
    setLoading(true);

    try {
      localStorage.setItem(PAT_STORAGE_KEY, token.trim());
      localStorage.setItem(OPENAI_KEY_STORAGE_KEY, openaiKey.trim());
      const { slug, path } = await runGenerate(
        token.trim(),
        openaiKey.trim(),
        buildTopicString() || undefined,
        loadBackground()
      );
      savePath(slug, path);
      addToPathIndex({
        slug,
        pathTitle: path.pathTitle,
        createdAt: new Date().toISOString(),
        articleCount: path.stages.flatMap((s) => s.articles).length,
        stageCount: path.stages.length,
      });
      router.push(`/path/${slug}?d=${encodePathForUrl(path)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleSuggest() {
    if (!token.trim() || !openaiKey.trim()) {
      setSuggestionsError("Enter both your daily.dev token and OpenAI key first.");
      return;
    }
    setSuggestionsError("");
    setSuggestionsLoading(true);
    setSuggestions([]);
    try {
      localStorage.setItem(PAT_STORAGE_KEY, token.trim());
      localStorage.setItem(OPENAI_KEY_STORAGE_KEY, openaiKey.trim());
      setSuggestions(await suggestPaths(token.trim(), openaiKey.trim()));
    } catch (err) {
      setSuggestionsError(
        err instanceof Error ? err.message : "Could not load suggestions. Please try again."
      );
    } finally {
      setSuggestionsLoading(false);
    }
  }

  async function handleTakeSuggestion(topic: string) {
    setLoadingSuggestion(topic);
    setError("");
    try {
      localStorage.setItem(PAT_STORAGE_KEY, token.trim());
      localStorage.setItem(OPENAI_KEY_STORAGE_KEY, openaiKey.trim());
      const { slug, path } = await runGenerate(token.trim(), openaiKey.trim(), topic, loadBackground());
      savePath(slug, path);
      addToPathIndex({
        slug,
        pathTitle: path.pathTitle,
        createdAt: new Date().toISOString(),
        articleCount: path.stages.flatMap((s) => s.articles).length,
        stageCount: path.stages.length,
      });
      router.push(`/path/${slug}?d=${encodePathForUrl(path)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoadingSuggestion(null);
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
  const canSuggest = token.trim().length > 0 && openaiKey.trim().length > 0;

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

  // Full-page loading state when taking a suggestion
  if (loadingSuggestion) {
    return (
      <div style={{ width: "100%", maxWidth: 520 }}>
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
            Building Your Path
          </h1>
          <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-jetbrains-var)", fontSize: 13, lineHeight: 1.6 }}>
            Curating articles for{" "}
            <span style={{ color: "var(--accent-primary)" }}>{loadingSuggestion}</span>…
          </p>
        </div>
        <LoadingMessages />
        {errorBlock}
      </div>
    );
  }

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
        <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-jetbrains-var)", fontSize: 13, lineHeight: 1.6 }}>
          Connect your daily.dev profile and pick your focus topics.
        </p>
      </div>

      {/* No profile banner */}
      {!hasProfile && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "10px 14px",
            backgroundColor: "rgba(139,92,246,0.08)",
            border: "1px solid rgba(139,92,246,0.25)",
            borderRadius: 8,
            marginBottom: 24,
          }}
        >
          <p style={{ fontFamily: "var(--font-jetbrains-var)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Set your profile once for better-tailored paths.
          </p>
          <Link
            href="/profile"
            style={{
              fontFamily: "var(--font-jetbrains-var)",
              fontSize: 12,
              color: "var(--accent-primary)",
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Set up →
          </Link>
        </div>
      )}

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

        {/* ── Suggest paths section ── */}
        <div style={{ borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              backgroundColor: "var(--bg-elevated)",
              borderBottom: suggestions.length > 0 || suggestionsLoading ? "1px solid var(--border)" : "none",
            }}
          >
            <div>
              <p style={{ fontFamily: "var(--font-syne-var)", color: "var(--text-primary)", fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
                ✦ Suggest paths for me
              </p>
              <p style={{ fontFamily: "var(--font-jetbrains-var)", color: "var(--text-muted)", fontSize: 11 }}>
                AI picks 3 topics based on your actual bookmarks & tags
              </p>
            </div>
            <button
              type="button"
              onClick={handleSuggest}
              disabled={!canSuggest || suggestionsLoading}
              style={{
                backgroundColor: canSuggest && !suggestionsLoading ? "var(--accent-primary)" : "var(--bg-surface)",
                border: `1px solid ${canSuggest && !suggestionsLoading ? "var(--accent-primary)" : "var(--border)"}`,
                color: canSuggest && !suggestionsLoading ? "#fff" : "var(--text-muted)",
                fontFamily: "var(--font-jetbrains-var)",
                fontSize: 12,
                fontWeight: 500,
                padding: "7px 14px",
                borderRadius: 9999,
                cursor: canSuggest && !suggestionsLoading ? "pointer" : "not-allowed",
                whiteSpace: "nowrap",
                flexShrink: 0,
                transition: "all 150ms ease",
              }}
            >
              {suggestionsLoading ? "Loading…" : suggestions.length > 0 ? "Refresh ↺" : "Suggest →"}
            </button>
          </div>

          {suggestionsError && (
            <p style={{ color: "#F87171", fontFamily: "var(--font-jetbrains-var)", fontSize: 12, padding: "10px 16px", backgroundColor: "rgba(248, 113, 113, 0.06)" }}>
              {suggestionsError}
            </p>
          )}

          {suggestionsLoading && (
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: 64, borderRadius: 8, backgroundColor: "var(--bg-surface)", opacity: 1 - i * 0.15 }} />
              ))}
            </div>
          )}

          {suggestions.length > 0 && !suggestionsLoading && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {suggestions.map((s, i) => (
                <div
                  key={s.topic}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "14px 16px",
                    borderBottom: i < suggestions.length - 1 ? "1px solid var(--border)" : "none",
                    backgroundColor: "var(--bg-surface)",
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1.4 }}>{s.emoji}</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: "var(--font-syne-var)", color: "var(--text-primary)", fontSize: 13, fontWeight: 700, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {s.topic}
                      </p>
                      <p style={{ fontFamily: "var(--font-jetbrains-var)", color: "var(--text-muted)", fontSize: 11, lineHeight: 1.5 }}>
                        {s.description}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTakeSuggestion(s.topic)}
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--accent-primary)",
                      fontFamily: "var(--font-jetbrains-var)",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "6px 12px",
                      borderRadius: 9999,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      transition: "border-color 150ms ease, background 150ms ease",
                    }}
                    className="hover:opacity-90"
                  >
                    Take →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 1, backgroundColor: "var(--border)" }} />
          <span style={{ fontFamily: "var(--font-jetbrains-var)", fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
            or choose your own topic
          </span>
          <div style={{ flex: 1, height: 1, backgroundColor: "var(--border)" }} />
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

        {loading && <LoadingMessages />}

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
            width: "100%",
            transition: "background 200ms ease",
          }}
          className={loading ? "" : "hover:opacity-90"}
        >
          {loading ? "Generating..." : "Generate My Learning Path →"}
        </button>
      </div>
    </div>
  );
}

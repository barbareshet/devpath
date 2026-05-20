"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { syncPathIndex, removeFromPathIndex, loadProgress } from "@/lib/storage";
import type { PathIndexEntry } from "@/types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function MyPaths() {
  const router = useRouter();
  const [entries, setEntries] = useState<PathIndexEntry[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const index = syncPathIndex();
    setEntries(index);

    // Compute completion % for each path
    const pct: Record<string, number> = {};
    for (const entry of index) {
      const p = loadProgress(entry.slug);
      const done = Object.values(p).filter(Boolean).length;
      pct[entry.slug] =
        entry.articleCount > 0
          ? Math.round((done / entry.articleCount) * 100)
          : 0;
    }
    setProgress(pct);
    setMounted(true);
  }, []);

  function handleDelete(e: React.MouseEvent, slug: string) {
    e.stopPropagation();
    removeFromPathIndex(slug);
    setEntries((prev) => prev.filter((e) => e.slug !== slug));
  }

  if (!mounted || entries.length === 0) return null;

  return (
    <div style={{ width: "100%", maxWidth: 520, marginTop: 48 }}>
      {/* Divider */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: 32,
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-syne-var)",
            color: "var(--text-primary)",
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          Previous Paths
        </h2>
        <p
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-jetbrains-var)",
            fontSize: 11,
          }}
        >
          Stored in this browser · {entries.length} path{entries.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {entries.map((entry) => {
          const pct = progress[entry.slug] ?? 0;
          const isComplete = pct === 100;

          return (
            <div
              key={entry.slug}
              onClick={() => router.push(`/path/${entry.slug}`)}
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "14px 16px",
                cursor: "pointer",
                transition: "border-color 150ms ease, background 150ms ease",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "var(--accent-primary)";
                (e.currentTarget as HTMLDivElement).style.backgroundColor =
                  "var(--bg-elevated)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "var(--border)";
                (e.currentTarget as HTMLDivElement).style.backgroundColor =
                  "var(--bg-surface)";
              }}
            >
              {/* Title row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-syne-var)",
                    fontSize: 13,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    flex: 1,
                  }}
                >
                  {entry.pathTitle}
                </span>

                {/* Delete */}
                <button
                  onClick={(e) => handleDelete(e, entry.slug)}
                  title="Remove from list"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: 14,
                    padding: "0 2px",
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLButtonElement).style.color = "#F87171")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLButtonElement).style.color =
                      "var(--text-muted)")
                  }
                >
                  ×
                </button>
              </div>

              {/* Meta row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 10,
                  fontFamily: "var(--font-jetbrains-var)",
                  fontSize: 11,
                  color: "var(--text-muted)",
                }}
              >
                <span>{timeAgo(entry.createdAt)}</span>
                <span>·</span>
                <span>{entry.stageCount} stages</span>
                <span>·</span>
                <span>{entry.articleCount} articles</span>
                {isComplete && (
                  <>
                    <span>·</span>
                    <span style={{ color: "var(--accent-green)" }}>✓ Complete</span>
                  </>
                )}
              </div>

              {/* Progress bar */}
              <div
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  height: 3,
                  borderRadius: 9999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: isComplete
                      ? "var(--accent-green)"
                      : "linear-gradient(to right, var(--accent-primary), var(--accent-green))",
                    borderRadius: 9999,
                    transition: "width 500ms ease",
                  }}
                />
              </div>

              {pct > 0 && (
                <p
                  style={{
                    color: isComplete
                      ? "var(--accent-green)"
                      : "var(--text-muted)",
                    fontFamily: "var(--font-jetbrains-var)",
                    fontSize: 10,
                    marginTop: 4,
                    textAlign: "right",
                  }}
                >
                  {pct}% read
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

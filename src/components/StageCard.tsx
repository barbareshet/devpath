"use client";

import type { Stage } from "@/types";
import ProgressBar from "./ProgressBar";

interface StageCardProps {
  stage: Stage;
  stageIndex: number;
  progress: Record<string, boolean>;
  onToggleRead: (articleId: string, read: boolean) => void;
}

export default function StageCard({
  stage,
  stageIndex,
  progress,
  onToggleRead,
}: StageCardProps) {
  const total = stage.articles.length;
  const completed = stage.articles.filter((a) => progress[a.articleId]).length;
  const isComplete = total > 0 && completed === total;

  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
      }}
      className="p-5"
    >
      {/* Stage header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <span
            style={{
              color: "var(--accent-primary)",
              fontFamily: "var(--font-syne-var)",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Stage {String(stageIndex + 1).padStart(2, "0")}
          </span>
          <h2
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-syne-var)",
              fontSize: 18,
              fontWeight: 700,
              marginTop: 2,
              lineHeight: 1.3,
            }}
          >
            {stage.title}
          </h2>
          {stage.description && (
            <p
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-jetbrains-var)",
                fontSize: 12,
                marginTop: 4,
                lineHeight: 1.5,
              }}
            >
              {stage.description}
            </p>
          )}
        </div>

        <span
          style={{
            color: isComplete ? "var(--accent-green)" : "var(--text-secondary)",
            fontFamily: "var(--font-jetbrains-var)",
            fontSize: 12,
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          {completed}/{total} ✓
        </span>
      </div>

      {/* Stage progress bar */}
      <div className="mb-4">
        <ProgressBar completed={completed} total={total} size="sm" />
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--border)", marginBottom: 16 }} />

      {/* Articles */}
      <div className="flex flex-col gap-4">
        {stage.articles.map((item) => {
          const isRead = !!progress[item.articleId];
          const article = item.article;

          return (
            <div
              key={item.articleId}
              style={{
                borderLeft: `3px solid ${isRead ? "var(--accent-green)" : "var(--border)"}`,
                paddingLeft: 12,
                transition: "border-color 300ms ease",
              }}
            >
              {/* Title + meta row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ color: "var(--text-muted)", fontSize: 13 }}>📄</span>
                    <span
                      style={{
                        color: isRead ? "var(--text-muted)" : "var(--text-primary)",
                        fontFamily: "var(--font-jetbrains-var)",
                        fontSize: 13,
                        fontWeight: 500,
                        lineHeight: 1.4,
                        transition: "color 300ms ease",
                      }}
                    >
                      {article?.title ?? item.articleId}
                    </span>
                    {article?.readTime && (
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-jetbrains-var)",
                          fontSize: 11,
                          flexShrink: 0,
                        }}
                      >
                        {article.readTime}m
                      </span>
                    )}
                  </div>

                  {article?.source && (
                    <p
                      style={{
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-jetbrains-var)",
                        fontSize: 11,
                        marginTop: 2,
                        paddingLeft: 21,
                      }}
                    >
                      {article.source}
                    </p>
                  )}
                </div>
              </div>

              {/* Why this? */}
              <p
                style={{
                  color: "var(--accent-yellow)",
                  fontFamily: "var(--font-jetbrains-var)",
                  fontSize: 12,
                  fontStyle: "italic",
                  marginTop: 8,
                  lineHeight: 1.5,
                }}
              >
                ✦ {item.why}
              </p>

              {/* Actions row */}
              <div
                className="flex items-center justify-between mt-3"
                style={{ gap: 12 }}
              >
                <label
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={isRead}
                    onChange={() => onToggleRead(item.articleId, !isRead)}
                    style={{ accentColor: "var(--accent-green)", cursor: "pointer" }}
                  />
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-jetbrains-var)",
                      fontSize: 12,
                    }}
                  >
                    Mark as read
                  </span>
                </label>

                {article?.id && (
                  <a
                    href={`https://app.daily.dev/posts/${article.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--accent-primary)",
                      border: "1px solid var(--border)",
                      fontFamily: "var(--font-jetbrains-var)",
                      fontSize: 12,
                      padding: "4px 10px",
                      borderRadius: 4,
                      textDecoration: "none",
                      flexShrink: 0,
                    }}
                    className="hover:opacity-75 transition-opacity"
                  >
                    → Open
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

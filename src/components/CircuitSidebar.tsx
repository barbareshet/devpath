"use client";

import type { Stage } from "@/types";

interface CircuitSidebarProps {
  stages: Stage[];
  progress: Record<string, boolean>;
}

export default function CircuitSidebar({ stages, progress }: CircuitSidebarProps) {
  const nodeSpacing = 80;
  const cx = 20;
  const topPad = 24;
  const svgHeight = topPad * 2 + (stages.length - 1) * nodeSpacing;

  return (
    <div className="hidden lg:flex flex-col items-center select-none">
      <svg width={80} height={svgHeight} style={{ overflow: "visible" }}>
        {/* Background line */}
        <line
          x1={cx}
          y1={topPad}
          x2={cx}
          y2={svgHeight - topPad}
          stroke="var(--border)"
          strokeWidth={2}
          strokeLinecap="round"
        />

        {stages.map((stage, i) => {
          const cy = topPad + i * nodeSpacing;
          const total = stage.articles.length;
          const done = stage.articles.filter((a) => progress[a.articleId]).length;
          const isComplete = total > 0 && done === total;
          const isActive = done > 0 && !isComplete;

          const nodeColor = isComplete
            ? "var(--accent-green)"
            : isActive
            ? "var(--accent-primary)"
            : "var(--bg-elevated)";

          const strokeColor = isComplete
            ? "var(--accent-green)"
            : isActive
            ? "var(--accent-primary)"
            : "var(--border)";

          // Draw filled progress line between prev and current node
          const prevCy = topPad + (i - 1) * nodeSpacing;

          return (
            <g key={stage.id}>
              {/* Completed segment above this node */}
              {i > 0 && isComplete && (
                <line
                  x1={cx}
                  y1={prevCy}
                  x2={cx}
                  y2={cy}
                  stroke="var(--accent-green)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              )}

              {/* Glow ring for active node */}
              {isActive && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={11}
                  fill="var(--accent-primary)"
                  opacity={0.18}
                />
              )}

              {/* Node circle */}
              <circle
                cx={cx}
                cy={cy}
                r={6}
                fill={nodeColor}
                stroke={strokeColor}
                strokeWidth={1.5}
                style={{ transition: "fill 400ms ease, stroke 400ms ease" }}
              />

              {/* Stage number label */}
              <text
                x={cx + 16}
                y={cy + 1}
                dominantBaseline="middle"
                style={{
                  fontFamily: "var(--font-jetbrains-var)",
                  fontSize: 10,
                  fill: isComplete
                    ? "var(--accent-green)"
                    : isActive
                    ? "var(--accent-primary)"
                    : "var(--text-muted)",
                  transition: "fill 400ms ease",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

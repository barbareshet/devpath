interface ProgressBarProps {
  completed: number;
  total: number;
  size?: "sm" | "lg";
}

export default function ProgressBar({
  completed,
  total,
  size = "lg",
}: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const barHeight = size === "lg" ? 8 : 4;

  return (
    <div className="w-full">
      {size === "lg" && (
        <div
          className="flex justify-between items-center mb-2"
          style={{ fontFamily: "var(--font-jetbrains-var)" }}
        >
          <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>
            {completed} of {total} articles completed
          </span>
          <span
            style={{
              color: percent === 100 ? "var(--accent-green)" : "var(--accent-primary)",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {percent}%
          </span>
        </div>
      )}

      <div
        style={{
          backgroundColor: "var(--bg-elevated)",
          height: barHeight,
          borderRadius: 9999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background:
              percent === 100
                ? "var(--accent-green)"
                : "linear-gradient(to right, var(--accent-primary), var(--accent-green))",
            borderRadius: 9999,
            transition: "width 500ms ease",
          }}
        />
      </div>
    </div>
  );
}

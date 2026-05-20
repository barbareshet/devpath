interface ProfileChipProps {
  username: string;
  avatar?: string;
  tags: string[];
}

export default function ProfileChip({ username, avatar, tags }: ProfileChipProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          overflow: "hidden",
          border: "1px solid var(--border)",
          flexShrink: 0,
          backgroundColor: "var(--bg-elevated)",
        }}
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={username}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 12,
              fontFamily: "var(--font-syne-var)",
              fontWeight: 700,
            }}
          >
            {username[0]?.toUpperCase()}
          </div>
        )}
      </div>

      {/* Username */}
      <span
        style={{
          color: "var(--text-primary)",
          fontFamily: "var(--font-jetbrains-var)",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        @{username}
      </span>

      {/* Top 3 tag pills */}
      {tags.slice(0, 3).map((tag) => (
        <span
          key={tag}
          style={{
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-jetbrains-var)",
            fontSize: 11,
            padding: "2px 8px",
            borderRadius: 4,
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

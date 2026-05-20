import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      style={{
        backgroundColor: "rgba(14, 18, 23, 0.85)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        height: "56px",
      }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-6"
    >
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-syne-var)",
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}
        className="text-xl font-extrabold"
      >
        DevPath
      </Link>

      <div className="flex items-center gap-6 ml-auto">
        <Link
          href="/how-it-works"
          style={{
            fontFamily: "var(--font-jetbrains-var)",
            color: "var(--text-secondary)",
            fontSize: 13,
            textDecoration: "none",
          }}
          className="hover:text-[var(--text-primary)] transition-colors"
        >
          How it works
        </Link>
        <Link
          href="/generate"
          style={{
            fontFamily: "var(--font-jetbrains-var)",
            backgroundColor: "var(--accent-primary)",
            color: "#fff",
            fontSize: 12,
            padding: "6px 16px",
            borderRadius: 9999,
            textDecoration: "none",
          }}
          className="hover:opacity-90 transition-opacity"
        >
          Generate →
        </Link>
      </div>
    </nav>
  );
}

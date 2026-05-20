import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <div style={{ backgroundColor: "var(--bg-base)", minHeight: "100vh" }}>
      <Navbar />

      <main className="pt-14 max-w-4xl mx-auto px-6 lg:px-12">
        {/* Hero section */}
        <section className="flex flex-col items-start justify-center min-h-[88vh] py-20">
          {/* Badge */}
          <div
            style={{
              color: "var(--accent-primary)",
              border: "1px solid var(--accent-primary)",
              fontFamily: "var(--font-jetbrains-var)",
              fontSize: 11,
              padding: "4px 12px",
              borderRadius: 9999,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 32,
            }}
          >
            <span>✦</span>
            <span>daily.dev Hackathon 2025</span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "var(--font-syne-var)",
              color: "var(--text-primary)",
              fontSize: "clamp(40px, 7vw, 72px)",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              marginBottom: 24,
              maxWidth: 720,
            }}
          >
            Your Learning Path,{" "}
            <span style={{ color: "var(--accent-primary)" }}>
              Curated by AI
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              color: "var(--text-secondary)",
              fontFamily: "var(--font-jetbrains-var)",
              fontSize: 16,
              lineHeight: 1.7,
              maxWidth: 480,
              marginBottom: 40,
            }}
          >
            Connect your daily.dev profile and get a structured, personalized
            learning path — built from your bookmarks, followed tags, and tech
            stack.
          </p>

          {/* CTA */}
          <Link
            href="/generate"
            style={{
              background: "var(--accent-primary)",
              color: "#fff",
              fontFamily: "var(--font-jetbrains-var)",
              fontSize: 14,
              fontWeight: 500,
              padding: "14px 32px",
              borderRadius: 9999,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
            className="cta-glow hover:opacity-90 transition-opacity"
          >
            Generate My Path →
          </Link>
        </section>

        {/* Feature highlights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-24">
          {[
            {
              icon: "⚡",
              title: "From Your Profile",
              desc: "Uses your bookmarks, followed tags, and tech stack — not a generic list.",
            },
            {
              icon: "🧠",
              title: "AI-Curated Stages",
              desc: "GPT-4o organizes articles into 3–5 stages, foundational to advanced.",
            },
            {
              icon: "📤",
              title: "Shareable Link",
              desc: "Every path gets a public URL you can post on Twitter or LinkedIn.",
            },
          ].map((f) => (
            <div
              key={f.title}
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 20,
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 12 }}>{f.icon}</div>
              <h3
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-syne-var)",
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-jetbrains-var)",
                  fontSize: 12,
                  lineHeight: 1.6,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

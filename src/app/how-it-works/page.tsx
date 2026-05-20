import Link from "next/link";
import Navbar from "@/components/Navbar";

const STEPS = [
  {
    number: "01",
    title: "Get your daily.dev API token",
    description:
      "Go to app.daily.dev/settings/api and generate a Personal Access Token. This requires a daily.dev Plus subscription. Your token stays in your browser — it's never sent to our servers except to fetch your profile data.",
    cta: { label: "Get your token →", href: "https://app.daily.dev/settings/api" },
  },
  {
    number: "02",
    title: "Choose a focus topic (optional)",
    description:
      "Pick up to 3 topics you want to grow in — React, System Design, DevOps, or anything custom. Leave it blank and DevPath will infer the best direction from your reading history and followed tags.",
  },
  {
    number: "03",
    title: "AI builds your personal path",
    description:
      "DevPath fetches your bookmarks, followed tags, and tech stack from daily.dev. GPT-4o then selects 12–18 relevant articles and organizes them into 3–5 learning stages, ordered from foundational to advanced — with a personalized reason for each article.",
  },
  {
    number: "04",
    title: "Work through your stages",
    description:
      "Each article has an [→ Open] link that takes you directly to the post on daily.dev. Mark articles as read as you go — your progress is saved in your browser and visualized with a circuit-line sidebar.",
  },
  {
    number: "05",
    title: "Share your path",
    description:
      "Every path gets a unique URL you can post on Twitter/X or LinkedIn. Note: paths are stored in your browser's local storage, so the link works best when opened in the same browser you generated it from.",
  },
];

const FAQS = [
  {
    q: "What data does DevPath access?",
    a: "Your daily.dev bookmarks, followed tags, and tech stack — fetched once per generation using your PAT. DevPath never stores this data on a server.",
  },
  {
    q: "Where are my paths stored?",
    a: "Entirely in your browser's localStorage. There's no database. Clearing your browser data will remove your paths.",
  },
  {
    q: "Do I need a daily.dev Plus subscription?",
    a: "Yes — the daily.dev Public API requires Plus to generate a Personal Access Token. The subscription is with daily.dev, not DevPath.",
  },
  {
    q: "What model powers the path generation?",
    a: "OpenAI GPT-4o with JSON mode, which guarantees a structured, parseable response every time.",
  },
  {
    q: "Can I share my path with someone else?",
    a: "You can share the URL, but the recipient will only see the path if they open it in the same browser where it was generated. Cross-device sharing is a planned feature.",
  },
];

export default function HowItWorksPage() {
  return (
    <div style={{ backgroundColor: "var(--bg-base)", minHeight: "100vh" }}>
      <Navbar />

      <main className="pt-14 max-w-3xl mx-auto px-6 lg:px-8 pb-24">
        {/* Header */}
        <div className="pt-16 pb-12" style={{ borderBottom: "1px solid var(--border)" }}>
          <p
            style={{
              color: "var(--accent-primary)",
              fontFamily: "var(--font-jetbrains-var)",
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            ✦ How it works
          </p>
          <h1
            style={{
              fontFamily: "var(--font-syne-var)",
              color: "var(--text-primary)",
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            From your daily.dev profile
            <br />
            to a structured learning path
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontFamily: "var(--font-jetbrains-var)",
              fontSize: 14,
              lineHeight: 1.7,
              maxWidth: 520,
            }}
          >
            DevPath uses your reading habits and interests as raw signal, then
            lets GPT-4o do the curriculum design — so you spend time learning,
            not planning.
          </p>
        </div>

        {/* Steps */}
        <div className="py-12" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex flex-col gap-10">
            {STEPS.map((step) => (
              <div key={step.number} className="flex gap-6">
                {/* Number */}
                <div style={{ flexShrink: 0, paddingTop: 2 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-syne-var)",
                      color: "var(--accent-primary)",
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-syne-var)",
                      color: "var(--text-primary)",
                      fontSize: 18,
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  >
                    {step.title}
                  </h2>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-jetbrains-var)",
                      fontSize: 13,
                      lineHeight: 1.7,
                      marginBottom: step.cta ? 12 : 0,
                    }}
                  >
                    {step.description}
                  </p>
                  {step.cta && (
                    <a
                      href={step.cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--accent-primary)",
                        fontFamily: "var(--font-jetbrains-var)",
                        fontSize: 12,
                        textDecoration: "none",
                      }}
                      className="hover:opacity-75 transition-opacity"
                    >
                      {step.cta.label}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="py-12" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2
            style={{
              fontFamily: "var(--font-syne-var)",
              color: "var(--text-primary)",
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 24,
            }}
          >
            FAQ
          </h2>
          <div className="flex flex-col gap-6">
            {FAQS.map((faq) => (
              <div key={faq.q}>
                <p
                  style={{
                    fontFamily: "var(--font-syne-var)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  {faq.q}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-jetbrains-var)",
                    color: "var(--text-secondary)",
                    fontSize: 13,
                    lineHeight: 1.7,
                  }}
                >
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="pt-12 flex items-center gap-6">
          <Link
            href="/"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-jetbrains-var)",
              fontSize: 13,
              textDecoration: "none",
            }}
            className="hover:text-[var(--text-secondary)] transition-colors"
          >
            ← Back to home
          </Link>
          <Link
            href="/generate"
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "#fff",
              fontFamily: "var(--font-jetbrains-var)",
              fontSize: 14,
              fontWeight: 500,
              padding: "12px 28px",
              borderRadius: 9999,
              textDecoration: "none",
            }}
            className="hover:opacity-90 transition-opacity"
          >
            Generate my path →
          </Link>
        </div>
      </main>
    </div>
  );
}

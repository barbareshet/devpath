"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProfileChip from "@/components/ProfileChip";
import ProgressBar from "@/components/ProgressBar";
import StageCard from "@/components/StageCard";
import ShareBar from "@/components/ShareBar";
import CircuitSidebar from "@/components/CircuitSidebar";
import { loadPath, loadProgress, saveProgress, savePath, addToPathIndex } from "@/lib/storage";
import type { GeneratedPath } from "@/types";

const RELATED_TOPIC_MAP: Record<string, string[]> = {
  react: ["TypeScript", "Next.js", "Testing"],
  typescript: ["React", "Node.js", "System Design"],
  "node.js": ["Docker", "GraphQL", "AWS"],
  "system design": ["Kubernetes", "AWS", "Performance"],
  kubernetes: ["Docker", "DevOps", "AWS"],
  docker: ["Kubernetes", "DevOps", "CI/CD"],
  devops: ["Kubernetes", "Docker", "AWS"],
  "next.js": ["React", "TypeScript", "Performance"],
  rust: ["System Design", "Performance", "WebAssembly"],
  graphql: ["Node.js", "TypeScript", "REST APIs"],
  aws: ["Kubernetes", "DevOps", "Serverless"],
  "ai / llms": ["Python", "System Design", "TypeScript"],
  performance: ["System Design", "DevOps", "React"],
  security: ["DevOps", "Node.js", "AWS"],
  python: ["AI / LLMs", "System Design", "Testing"],
};

function getRelatedTopics(path: GeneratedPath): string[] {
  const tagSet = new Set<string>();
  path.stages
    .flatMap((s) => s.articles)
    .forEach((a) => a.article?.tags?.slice(0, 3).forEach((t) => tagSet.add(t)));

  const titleWords = path.pathTitle.toLowerCase();
  const matchedKey = Object.keys(RELATED_TOPIC_MAP).find((k) =>
    titleWords.includes(k)
  );

  const fromMap = matchedKey ? RELATED_TOPIC_MAP[matchedKey] : [];
  const fromTags = [...tagSet]
    .slice(0, 3)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1));

  return [...new Set([...fromMap, ...fromTags])].slice(0, 6);
}

export default function PathPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [path, setPath] = useState<GeneratedPath | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setMounted(true);

    let stored = loadPath(slug);

    // If not in localStorage, try decoding from ?d= URL param
    if (!stored) {
      try {
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get("d");
        if (encoded) {
          const decoded: GeneratedPath = JSON.parse(decodeURIComponent(atob(encoded)));
          if (decoded.pathTitle && Array.isArray(decoded.stages)) {
            savePath(slug, decoded);
            addToPathIndex({
              slug,
              pathTitle: decoded.pathTitle,
              createdAt: new Date().toISOString(),
              articleCount: decoded.stages.flatMap((s) => s.articles).length,
              stageCount: decoded.stages.length,
            });
            stored = decoded;
            // Clean the URL so it doesn't stay cluttered
            history.replaceState(null, "", `/path/${slug}`);
          }
        }
      } catch {
        // Malformed data — fall through to "not found"
      }
    }

    setPath(stored);
    setProgress(loadProgress(slug));
  }, [slug]);

  const handleToggleRead = useCallback(
    (articleId: string, read: boolean) => {
      setProgress((prev) => ({ ...prev, [articleId]: read }));
      saveProgress(slug, articleId, read);
    },
    [slug]
  );

  const allArticles = path?.stages.flatMap((s) => s.articles) ?? [];
  const completedCount = allArticles.filter((a) => progress[a.articleId]).length;
  const totalCount = allArticles.length;
  const isPathComplete = totalCount > 0 && completedCount === totalCount;

  const username = slug?.split("-")[0] ?? "dev";

  const tagSet = new Set<string>();
  path?.stages
    .flatMap((s) => s.articles)
    .forEach((a) => a.article?.tags?.slice(0, 2).forEach((t) => tagSet.add(t)));
  const topTags = [...tagSet].slice(0, 3);

  // --- Loading state ---
  if (!mounted) {
    return (
      <div style={{ backgroundColor: "var(--bg-base)", minHeight: "100vh" }}>
        <Navbar />
      </div>
    );
  }

  // --- Not found ---
  if (!path) {
    return (
      <div
        style={{ backgroundColor: "var(--bg-base)", minHeight: "100vh" }}
        className="flex flex-col"
      >
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <span style={{ fontSize: 40 }}>🔍</span>
          <h1
            style={{
              fontFamily: "var(--font-syne-var)",
              color: "var(--text-primary)",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            Path not found
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontFamily: "var(--font-jetbrains-var)",
              fontSize: 13,
            }}
          >
            This path lives in your browser&apos;s local storage. Try opening it
            in the browser where you generated it.
          </p>
          <button
            onClick={() => router.push("/generate")}
            style={{
              background: "var(--accent-primary)",
              color: "#fff",
              fontFamily: "var(--font-jetbrains-var)",
              fontSize: 13,
              padding: "10px 24px",
              borderRadius: 9999,
              border: "none",
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            Generate a new path →
          </button>
        </main>
      </div>
    );
  }

  const relatedTopics = getRelatedTopics(path);

  return (
    <div style={{ backgroundColor: "var(--bg-base)", minHeight: "100vh" }}>
      <Navbar />

      <main className="pt-14 max-w-5xl mx-auto px-4 lg:px-8 pb-24">
        {/* Back navigation */}
        <div
          className="flex items-center gap-4 pt-6 pb-4"
          style={{ fontFamily: "var(--font-jetbrains-var)", fontSize: 12 }}
        >
          <button
            onClick={() => router.push("/generate")}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--text-secondary)" }}
            className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
          >
            ← Generate new path
          </button>
          <span style={{ color: "var(--border)" }}>|</span>
          <button
            onClick={() => router.push("/")}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--text-secondary)" }}
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            Home
          </button>
        </div>

        {/* Page header */}
        <div
          style={{ borderBottom: "1px solid var(--border)", paddingBottom: 24, marginBottom: 24 }}
        >
          <div className="mb-4">
            <ProfileChip username={username} tags={topTags} />
          </div>

          <h1
            style={{
              fontFamily: "var(--font-syne-var)",
              color: "var(--text-primary)",
              fontSize: "clamp(22px, 4vw, 36px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: 8,
            }}
          >
            {path.pathTitle}
          </h1>

          <p
            style={{
              color: "var(--text-secondary)",
              fontFamily: "var(--font-jetbrains-var)",
              fontSize: 13,
              lineHeight: 1.6,
              maxWidth: 600,
              marginBottom: 20,
            }}
          >
            {path.pathSummary}
          </p>

          <div
            className="flex items-center gap-4 flex-wrap"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-jetbrains-var)",
              fontSize: 12,
              marginBottom: 20,
            }}
          >
            <span>⏱ ~{path.estimatedTotalMinutes} min total</span>
            <span>📚 {totalCount} articles</span>
            <span>🔖 {path.stages.length} stages</span>
          </div>

          <ProgressBar completed={completedCount} total={totalCount} size="lg" />
        </div>

        {/* Main content */}
        <div className="flex gap-6 lg:gap-10">
          <div className="flex-shrink-0 pt-2">
            <CircuitSidebar stages={path.stages} progress={progress} />
          </div>

          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {path.stages.map((stage, i) => (
              <StageCard
                key={stage.id}
                stage={stage}
                stageIndex={i}
                progress={progress}
                onToggleRead={handleToggleRead}
              />
            ))}
          </div>
        </div>

        {/* Completion banner + related paths */}
        {isPathComplete && (
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--accent-green)",
              borderRadius: 8,
              padding: 24,
              marginTop: 32,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span style={{ fontSize: 24 }}>🎉</span>
              <h2
                style={{
                  fontFamily: "var(--font-syne-var)",
                  color: "var(--accent-green)",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                Path complete!
              </h2>
            </div>
            <p
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-jetbrains-var)",
                fontSize: 13,
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              You&apos;ve finished all {totalCount} articles. Ready to go deeper?
              Pick a related topic to generate your next path:
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {relatedTopics.map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    router.push(`/generate?topic=${encodeURIComponent(t)}`)
                  }
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-jetbrains-var)",
                    fontSize: 12,
                    padding: "6px 14px",
                    borderRadius: 9999,
                    cursor: "pointer",
                    transition: "border-color 150ms, color 150ms",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.borderColor = "var(--accent-primary)";
                    (e.target as HTMLButtonElement).style.color = "var(--accent-primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.borderColor = "var(--border)";
                    (e.target as HTMLButtonElement).style.color = "var(--text-primary)";
                  }}
                >
                  {t} →
                </button>
              ))}
            </div>

            <button
              onClick={() => router.push("/generate")}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "var(--text-muted)",
                fontFamily: "var(--font-jetbrains-var)",
                fontSize: 12,
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              Or choose a different topic
            </button>
          </div>
        )}

        {/* Share bar */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 24,
            marginTop: 32,
          }}
        >
          <ShareBar slug={slug} pathTitle={path.pathTitle} path={path} />
        </div>
      </main>
    </div>
  );
}

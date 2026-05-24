"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import MyPaths from "@/components/MyPaths";
import { syncPathIndex } from "@/lib/storage";

export default function MyPathsPage() {
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    setIsEmpty(syncPathIndex().length === 0);
  }, []);

  return (
    <div style={{ backgroundColor: "var(--bg-base)", minHeight: "100vh" }}>
      <Navbar />
      <main
        className="flex flex-col items-center px-6"
        style={{ paddingTop: "calc(56px + 48px)", paddingBottom: 80 }}
      >
        <div style={{ width: "100%", maxWidth: 520 }}>
          <div style={{ marginBottom: 40 }}>
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
              My Learning Paths
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-jetbrains-var)",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              All paths you&apos;ve generated, stored in this browser.
            </p>
          </div>

          {isEmpty ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 24px",
                border: "1px dashed var(--border)",
                borderRadius: 10,
              }}
            >
              <p style={{ fontFamily: "var(--font-syne-var)", color: "var(--text-primary)", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                No paths yet
              </p>
              <p style={{ fontFamily: "var(--font-jetbrains-var)", color: "var(--text-muted)", fontSize: 12, marginBottom: 24 }}>
                Generate your first learning path to see it here.
              </p>
              <Link
                href="/generate"
                style={{
                  display: "inline-block",
                  backgroundColor: "var(--accent-primary)",
                  color: "#fff",
                  fontFamily: "var(--font-jetbrains-var)",
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "10px 20px",
                  borderRadius: 9999,
                  textDecoration: "none",
                }}
                className="hover:opacity-90"
              >
                Generate a path →
              </Link>
            </div>
          ) : (
            <MyPaths hideHeader />
          )}
        </div>
      </main>
    </div>
  );
}

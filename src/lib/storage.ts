import LZString from "lz-string";
import type { GeneratedPath, PathIndexEntry } from "@/types";

/** Strip article summaries (not shown in UI) to minimise URL size, then compress. */
export function encodePathForUrl(path: GeneratedPath): string {
  const slim: GeneratedPath = {
    ...path,
    stages: path.stages.map((s) => ({
      ...s,
      articles: s.articles.map((a) => ({
        ...a,
        article: a.article
          ? { ...a.article, summary: undefined }
          : undefined,
      })),
    })),
  };
  return LZString.compressToEncodedURIComponent(JSON.stringify(slim));
}

export function decodePathFromUrl(encoded: string): GeneratedPath | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const path = JSON.parse(json) as GeneratedPath;
    if (!path.pathTitle || !Array.isArray(path.stages)) return null;
    return path;
  } catch {
    return null;
  }
}

const INDEX_KEY = "devpath:index";

export function loadPathIndex(): PathIndexEntry[] {
  const raw = localStorage.getItem(INDEX_KEY);
  return raw ? (JSON.parse(raw) as PathIndexEntry[]) : [];
}

export function addToPathIndex(entry: PathIndexEntry): void {
  const current = loadPathIndex().filter((e) => e.slug !== entry.slug);
  localStorage.setItem(INDEX_KEY, JSON.stringify([entry, ...current]));
}

export function removeFromPathIndex(slug: string): void {
  const current = loadPathIndex().filter((e) => e.slug !== slug);
  localStorage.setItem(INDEX_KEY, JSON.stringify(current));
}

/**
 * Scans all localStorage keys and registers any devpath paths
 * that exist but aren't in the index yet (e.g. generated before
 * the index was introduced). Returns the merged, up-to-date index.
 */
export function syncPathIndex(): PathIndexEntry[] {
  const existing = loadPathIndex();
  const indexedSlugs = new Set(existing.map((e) => e.slug));
  const recovered: PathIndexEntry[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (!key.startsWith("devpath:")) continue;
    if (
      key === INDEX_KEY ||
      key === "devpath:pat" ||
      key.startsWith("devpath:progress:")
    )
      continue;

    const slug = key.slice("devpath:".length);
    if (indexedSlugs.has(slug)) continue;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const path = JSON.parse(raw) as GeneratedPath;
      if (!path.pathTitle || !Array.isArray(path.stages)) continue;

      recovered.push({
        slug,
        pathTitle: path.pathTitle,
        createdAt: new Date().toISOString(),
        articleCount: path.stages.flatMap((s) => s.articles).length,
        stageCount: path.stages.length,
      });
    } catch {
      // skip malformed entries
    }
  }

  if (recovered.length === 0) return existing;

  // Prepend recovered entries (newest-ish first) and persist
  const merged = [...existing, ...recovered];
  localStorage.setItem(INDEX_KEY, JSON.stringify(merged));
  return merged;
}

export function savePath(slug: string, path: GeneratedPath): void {
  localStorage.setItem(`devpath:${slug}`, JSON.stringify(path));
}

export function loadPath(slug: string): GeneratedPath | null {
  const raw = localStorage.getItem(`devpath:${slug}`);
  return raw ? (JSON.parse(raw) as GeneratedPath) : null;
}

export function saveProgress(
  slug: string,
  articleId: string,
  read: boolean
): void {
  const key = `devpath:progress:${slug}`;
  const current = JSON.parse(
    localStorage.getItem(key) ?? "{}"
  ) as Record<string, boolean>;
  current[articleId] = read;
  localStorage.setItem(key, JSON.stringify(current));
}

export function loadProgress(slug: string): Record<string, boolean> {
  return JSON.parse(
    localStorage.getItem(`devpath:progress:${slug}`) ?? "{}"
  ) as Record<string, boolean>;
}

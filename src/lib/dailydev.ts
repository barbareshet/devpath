import type { UserProfile, CandidateArticle } from "@/types";

const BASE_URL = "https://api.daily.dev/public/v1";

// Raw shapes from the daily.dev API
interface DailyDevPost {
  id: string;
  title: string;
  source?: {
    name?: string;
    handle?: string;
  };
  tags?: string[];
  readTime?: number;
  summary?: string;
}

interface DailyDevStackItem {
  id: string;
  tool: {
    title: string;
    faviconUrl?: string;
  };
}

interface DailyDevFeedResponse {
  data?: DailyDevPost[];
  hasNextPage?: boolean;
  cursor?: string;
}

interface DailyDevFilters {
  includeTags?: string[];
  blockedTags?: string[];
  includeSources?: string[];
  excludeSources?: string[];
}

interface DailyDevProfile {
  username: string;
  name?: string;
  bio?: string;
  image?: string;
}

async function dailyFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`daily.dev API ${res.status} on ${path}`);
  }

  return res.json() as Promise<T>;
}

function normalizePost(post: DailyDevPost): CandidateArticle {
  return {
    id: post.id,
    title: post.title,
    url: `https://app.daily.dev/posts/${post.id}`,
    source: post.source?.name ?? post.source?.handle ?? "daily.dev",
    tags: post.tags ?? [],
    readTime: post.readTime,
    summary: post.summary,
  };
}

export async function fetchProfile(
  token: string
): Promise<Pick<UserProfile, "username" | "avatar" | "bio" | "techStack">> {
  const [profile, stackData] = await Promise.all([
    dailyFetch<DailyDevProfile>("/profile/", token),
    dailyFetch<{ items?: DailyDevStackItem[] }>("/profile/stack/?limit=50", token),
  ]);

  const techStack = (stackData.items ?? [])
    .map((item) => item.tool?.title)
    .filter((t): t is string => Boolean(t));

  return {
    username: profile.username,
    avatar: profile.image,
    bio: profile.bio,
    techStack,
  };
}

export async function fetchFollowedTags(token: string): Promise<string[]> {
  const data = await dailyFetch<DailyDevFilters>("/feeds/filters/", token);
  return data.includeTags ?? [];
}

export async function fetchBookmarks(
  token: string
): Promise<{ articles: CandidateArticle[]; ids: string[] }> {
  const data = await dailyFetch<DailyDevFeedResponse>(
    "/bookmarks/?limit=50",
    token
  );
  const articles = (data.data ?? []).map(normalizePost);
  return {
    articles,
    ids: articles.map((a) => a.id),
  };
}

export async function fetchTagFeeds(
  tags: string[],
  token: string
): Promise<CandidateArticle[]> {
  const top3 = tags.slice(0, 3);
  if (top3.length === 0) return [];

  const results = await Promise.allSettled(
    top3.map((tag) =>
      dailyFetch<DailyDevFeedResponse>(
        `/feeds/tag/${encodeURIComponent(tag)}?limit=20`,
        token
      )
    )
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<DailyDevFeedResponse> =>
        r.status === "fulfilled"
    )
    .flatMap((r) => (r.value.data ?? []).map(normalizePost));
}

export async function buildCandidatePool(token: string): Promise<{
  profile: UserProfile;
  candidates: CandidateArticle[];
}> {
  // Fetch profile base, followed tags, and bookmarks in parallel
  const [profileBase, followedTags, bookmarkData] = await Promise.all([
    fetchProfile(token),
    fetchFollowedTags(token),
    fetchBookmarks(token),
  ]);

  // Fetch tag feeds for top 3 followed tags
  const tagArticles = await fetchTagFeeds(followedTags, token);

  // Merge, deduplicate by ID — bookmarks first (higher priority)
  const seen = new Set<string>();
  const candidates: CandidateArticle[] = [];

  for (const article of bookmarkData.articles) {
    if (!seen.has(article.id)) {
      seen.add(article.id);
      candidates.push(article);
    }
  }

  for (const article of tagArticles) {
    if (!seen.has(article.id) && candidates.length < 60) {
      seen.add(article.id);
      candidates.push(article);
    }
  }

  const profile: UserProfile = {
    ...profileBase,
    followedTags,
    bookmarkIds: bookmarkData.ids,
    recentlyReadTitles: [],
  };

  return { profile, candidates };
}

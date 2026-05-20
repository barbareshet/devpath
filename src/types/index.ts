export interface UserProfile {
  username: string;
  avatar?: string;
  bio?: string;
  followedTags: string[];
  techStack: string[];
  recentlyReadTitles: string[];
  bookmarkIds: string[];
}

export interface CandidateArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  tags: string[];
  readTime?: number;
  summary?: string;
}

export interface GeneratedPath {
  pathTitle: string;
  pathSummary: string;
  estimatedTotalMinutes: number;
  stages: Stage[];
}

export interface PathIndexEntry {
  slug: string;
  pathTitle: string;
  createdAt: string; // ISO date string
  articleCount: number;
  stageCount: number;
}

export interface Stage {
  id: string;
  title: string;
  description: string;
  articles: {
    articleId: string;
    why: string;
    article?: CandidateArticle; // hydrated client-side
  }[];
}

# CLAUDE.md — DevPath Project Context

This file gives Claude Code context about the DevPath project so it can assist effectively.
It also documents the OpenAI integration used inside the app for learning path generation.

---

## What is DevPath?

DevPath is a Next.js web app built for the daily.dev hackathon. It connects to a user's
daily.dev profile and uses OpenAI (gpt-4o) to generate a personalized, structured learning
path based on their reading history, bookmarks, followed tags, and tech stack.

---

## Project Stack (for Claude Code)

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth (daily.dev OAuth) |
| AI (in-app) | OpenAI API — `gpt-4o` |
| Data | daily.dev Public API |
| Persistence | localStorage (client-side) |
| Deployment | Vercel |

---

## Folder Structure

```
devpath/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing page
│   │   ├── generate/
│   │   │   └── page.tsx              # Path generator (authenticated)
│   │   ├── path/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Public learning path page
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts      # NextAuth handler
│   │   │   └── og/
│   │   │       └── [slug]/
│   │   │           └── route.tsx     # OG image generation (stretch)
│   │   └── actions/
│   │       └── generatePath.ts       # Server Action — calls OpenAI
│   ├── components/
│   │   ├── StageCard.tsx             # Learning path stage + articles
│   │   ├── ProfileChip.tsx           # Avatar + username + tags
│   │   ├── ProgressBar.tsx           # Overall + per-stage progress
│   │   ├── ShareBar.tsx              # X, LinkedIn, Copy Link
│   │   ├── CircuitSidebar.tsx        # SVG stage visualization (desktop)
│   │   └── LoadingMessages.tsx       # Typewriter loading state
│   ├── lib/
│   │   ├── dailydev.ts               # daily.dev API fetch helpers
│   │   ├── openai.ts                 # OpenAI client + prompt builders
│   │   ├── storage.ts                # localStorage read/write helpers
│   │   └── slugify.ts                # Slug generation utility
│   └── types/
│       └── index.ts                  # Shared TypeScript interfaces
├── .env.local                        # Never commit this
├── CLAUDE.md                         # This file
├── site.md                           # Product & feature requirements
└── design.md                         # Design system & component specs
```

---

## Environment Variables

```env
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
DAILY_DEV_CLIENT_ID=
DAILY_DEV_CLIENT_SECRET=
OPENAI_API_KEY=
```

---

## Key Conventions (for Claude Code)

- All AI calls happen **server-side only** via Server Actions in `app/actions/`
- Never expose `OPENAI_API_KEY` or `DAILY_DEV_CLIENT_SECRET` to the client
- localStorage is the only persistence layer — no DB
- Path slug format: `[username]-[stage1-title]-[nanoid(6)]`
- All daily.dev API calls go through `src/lib/dailydev.ts`
- All OpenAI calls go through `src/lib/openai.ts`

---

## OpenAI Integration (in-app AI agent)

### Model
```
gpt-4o
max_tokens: 4000
response_format: { type: "json_object" }
```

`json_object` mode guarantees valid JSON back — no try/catch needed on parse.

### Install
```bash
npm install openai
```

### Client Setup
```typescript
// src/lib/openai.ts
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

---

## Core Types

```typescript
// src/types/index.ts

export interface UserProfile {
  username: string;
  bio?: string;
  followedTags: string[];
  techStack: string[];
  recentlyReadTitles: string[];
  bookmarkIds: string[];
}

export interface CandidateArticle {
  id: string;
  title: string;
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

export interface Stage {
  id: string;
  title: string;
  description: string;
  articles: {
    articleId: string;
    why: string;
    article?: CandidateArticle;   // hydrated client-side
  }[];
}
```

---

## Server Action — generatePath

```typescript
// src/app/actions/generatePath.ts
"use server";

import { openai } from "@/lib/openai";
import { nanoid } from "nanoid";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/openai";
import type { UserProfile, CandidateArticle, GeneratedPath } from "@/types";

export async function generatePath(
  profile: UserProfile,
  candidates: CandidateArticle[],
  topicOverride?: string
): Promise<{ slug: string; path: GeneratedPath }> {

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(profile, candidates, topicOverride) },
    ],
  });

  const raw = response.choices[0].message.content ?? "{}";
  const parsed: GeneratedPath = JSON.parse(raw);

  // Filter out any article IDs that don't exist in our candidate pool
  const validIds = new Set(candidates.map(c => c.id));
  parsed.stages = parsed.stages.map(stage => ({
    ...stage,
    articles: stage.articles.filter(a => validIds.has(a.articleId)),
  }));

  // Generate slug
  const topicSlug = parsed.stages[0]?.title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const slug = `${profile.username}-${topicSlug}-${nanoid(6)}`;

  return { slug, path: parsed };
}
```

---

## OpenAI Prompts

### System Prompt
```
You are DevPath, an intelligent learning path curator for software developers.

You receive a developer's daily.dev profile and a pool of articles. Your job is to 
organize those articles into a structured, personalized learning path — ordered from 
foundational to advanced — that reflects where this specific developer is right now 
and where they want to grow.

Be specific. Reference the developer's actual tags, stack, and interests in your "why" 
explanations. Avoid generic statements like "this is a great article" — explain why it 
fits THIS person.

Respond ONLY with valid JSON matching the specified structure.
```

### User Prompt Rules
1. Select 12–18 articles from candidates
2. Use article IDs exactly as provided — never invent IDs
3. Group into 3–5 stages ordered foundational → advanced
4. Prioritize bookmarked articles (include at least 3 if relevant)
5. Skip recently read articles unless essential
6. Each article needs a personalized "why" (1–2 sentences)
7. Path title format: `"Your Path to [Topic], @username"`

---

## localStorage Helpers

```typescript
// src/lib/storage.ts

export function savePath(slug: string, path: GeneratedPath) {
  localStorage.setItem(`devpath:${slug}`, JSON.stringify(path));
}

export function loadPath(slug: string): GeneratedPath | null {
  const raw = localStorage.getItem(`devpath:${slug}`);
  return raw ? JSON.parse(raw) : null;
}

export function saveProgress(slug: string, articleId: string, read: boolean) {
  const key = `devpath:progress:${slug}`;
  const current = JSON.parse(localStorage.getItem(key) ?? "{}");
  current[articleId] = read;
  localStorage.setItem(key, JSON.stringify(current));
}

export function loadProgress(slug: string): Record<string, boolean> {
  return JSON.parse(localStorage.getItem(`devpath:progress:${slug}`) ?? "{}");
}
```

---

## Error Handling

| Scenario | Action |
|---|---|
| OpenAI returns bad structure | Validate shape, show retry button |
| Article IDs not in candidates | Silently filter out |
| Fewer than 5 articles returned | Render with warning |
| daily.dev returns empty bookmarks | Use tag feeds only |
| OpenAI 429 rate limit | Show "Try again in a moment" |
| OpenAI timeout | Set `timeout: 30000`, show retry |

---

## Stretch Goal — TIL Generation

If time allows after hour 60, add a TIL modal when a user marks an article as read:

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  max_tokens: 500,
  response_format: { type: "json_object" },
  messages: [
    { role: "system", content: "Write authentic developer TIL posts. Return only JSON." },
    { role: "user", content: `Article: ${title}\nSource: ${source}\n\nReturn: { "twitter": "string (max 240 chars)", "linkedin": "string (3-4 sentences)" }` }
  ],
});
```

# Site Requirements — DevPath (72h Hackathon Build)

## Overview

DevPath connects to a user's daily.dev profile and generates a personalized, AI-curated learning path based on their reading history, bookmarks, followed tags, and tech stack. Each path is structured, shareable, and progress-trackable.

---

## Hackathon Constraints

- **Duration:** 72 hours
- **Tracks covered:** Developer Identity + Content Intelligence + Content → Action
- **Submission:** Public deployed URL + social post tagging @dailydotdev
- **Bonus:** Shareable by other users

---

## Build Priority Tiers

### 🟢 Tier 1 — Must Ship (0–40h)
Core loop: connect → generate → view path → share

### 🟡 Tier 2 — Should Ship (40–60h)
Progress tracking, polish, deploy

### 🔴 Tier 3 — Stretch Goals (60–72h)
OG image card, TIL integration — only if Tier 1 & 2 are solid

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Server Actions for API calls |
| Styling | Tailwind CSS | Fast to build |
| Auth | NextAuth (daily.dev OAuth) | Single provider |
| AI | OpenAI API (`gpt-4o`) | JSON mode for reliable structured output |
| Data | daily.dev Public API | Profile + articles |
| Persistence | localStorage | Simple, no infra needed |
| OG Cards | Next.js `/api/og` + satori | Tier 3 stretch goal |
| Deployment | Vercel | Free tier, zero config |

> **Why localStorage over Vercel KV?**
> Progress tracking (read/unread) is personal and session-local. localStorage eliminates DB setup time with zero tradeoff for the core hackathon experience.

> **Why gpt-4o?**
> Fast, cost-effective, and supports `response_format: { type: "json_object" }` which guarantees valid JSON output — no parsing errors.

---

## Pages & Routes

### 🟢 `/` — Landing Page
- Hero: what DevPath does, one-liner
- "Connect with daily.dev" CTA button (triggers OAuth)
- 3 feature highlights (static, no interactivity needed)
- Optional: static mockup screenshot of a path

### 🟢 `/generate` — Path Generator (authenticated)
- Shows user's daily.dev profile summary: avatar, username, top 3 tags
- Optional topic focus input: "I want to focus on: ___"
- "Generate My Learning Path" button → Server Action → OpenAI
- Loading state with animated terminal-style messages
- On success: redirect to `/path/[slug]`

### 🟢 `/path/[slug]` — Learning Path Page (public)
- Personalized heading: *"Your DevOps Learning Path, @ido"*
- User profile chip (avatar + username + top tags)
- Stages list (3–5 stages, 3–5 articles each)
- Per article:
  - Title, source, estimated read time
  - "Why this?" — AI reason tailored to user
  - Link to article (opens in new tab)
  - ✅ Mark as Read (saved in localStorage)
- Progress bar per stage + overall percentage
- Share buttons: X (Twitter), LinkedIn, copy link

### 🟡 `/api/og/[slug]` — OG Image (Tier 2)
- Generates a shareable image using satori
- Shows: username, path title, article count, daily.dev branding
- Only build this after core path flow works

### 🔴 Stretch — TIL on article completion
- When user marks an article as read, optionally generate a TIL post via OpenAI
- Single modal with Twitter + LinkedIn versions
- Only if time allows in final 12h

---

## Data Flow (Happy Path)

```
User clicks "Connect"
  → NextAuth OAuth with daily.dev
  → Server fetches: profile + tags + bookmarks + recent history
  → Server assembles candidate article pool (max 60 articles)
  → Server Action calls OpenAI gpt-4o with profile + candidates
  → OpenAI returns guaranteed-valid JSON path (json_object mode)
  → Path stored in localStorage under slug key
  → User redirected to /path/[slug]
  → Path rendered from localStorage data
  → User marks articles as read (localStorage progress)
  → User copies share link → sends to friends
```

---

## daily.dev API Calls (Minimal Set)

Only fetch what's needed to avoid wasting time on API exploration:

| Endpoint | Purpose | Priority |
|---|---|---|
| `GET /v1/users/me` | Profile, username, avatar, stack | 🟢 Must |
| `GET /v1/tags/followed` | Followed tags | 🟢 Must |
| `GET /v1/bookmarks` | Saved articles (high intent) | 🟢 Must |
| `GET /v1/feeds/history` | Recently read (avoid repeats) | 🟢 Must |
| `GET /v1/feeds/[tag]` | Tag-specific article pool | 🟡 Should |
| `GET /v1/search?q=` | Topic override search | 🟡 Should |

---

## Storage Strategy

### Path Data (generated path JSON)
- Key: `devpath:[slug]`
- Stored in localStorage on the client after redirect
- Also passed as URL search param on first load as fallback

### Progress Data (read/unread per article)
- Key: `devpath:progress:[slug]`
- Object: `{ [articleId]: boolean }`
- Updated on every checkbox toggle

No backend DB needed for MVP.

---

## Realistic 72h Timeline

| Hours | Task |
|---|---|
| 0–4h | Project scaffold, NextAuth setup, daily.dev OAuth |
| 4–8h | daily.dev API integration (profile + bookmarks + history) |
| 8–14h | OpenAI integration + path JSON generation |
| 14–22h | `/path/[slug]` page — render stages + articles |
| 22–28h | Progress tracking (localStorage) + share buttons |
| 28–36h | Landing page + `/generate` page + loading states |
| 36–44h | UI polish, responsive, empty/error states |
| 44–52h | End-to-end testing, bug fixes |
| 52–60h | Deploy to Vercel, env vars, smoke test |
| 60–66h | OG image card (Tier 2 if time allows) |
| 66–72h | Buffer / submission prep / social post |

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

## Cut Features (post-hackathon roadmap)
- Fork/clone other users' paths
- Drag & drop article reordering
- Vercel KV / persistent server-side storage
- Email digest of path progress
- Multi-path dashboard
- Social feed of public paths

---

## Non-Goals (per hackathon rules)
- Do not rebuild daily.dev's existing bookmarks UI
- Do not rebuild reading streaks
- Do not rebuild existing briefings/digest
- Do not require Plus subscription

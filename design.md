# Design Requirements — DevPath (72h Scope)

## Aesthetic Direction

**Theme:** Dark, editorial, developer-native — like a terminal met a design system.

Inspired by daily.dev's own dark UI, VSCode, and Linear's precision. The feel should be **focused and intelligent** — not flashy. Developers should feel like this was built *for* them.

**One unforgettable detail:** A glowing vertical circuit-line connecting stages in the sidebar — nodes light up green as stages complete.

> **72h note:** Design is intentional but not over-engineered. Nail the core path page first. Landing page gets polish last.

---

## Color Palette

```css
:root {
  --bg-base:        #0E1217;   /* daily.dev bg — dark near-black */
  --bg-surface:     #171B21;   /* cards, panels */
  --bg-elevated:    #1E2430;   /* hover states */
  --border:         #2A3140;   /* subtle dividers */

  --accent-primary: #CE3DF3;   /* daily.dev brand purple */
  --accent-glow:    #CE3DF340;
  --accent-green:   #3DDD73;   /* progress + completed */
  --accent-yellow:  #F5C542;   /* "why this?" highlights */

  --text-primary:   #F0F4F8;
  --text-secondary: #8B9EB0;
  --text-muted:     #4A5568;
}
```

---

## Typography

| Role | Font | Weight |
|---|---|---|
| Headings | `Syne` | 700–800 |
| Body / UI | `JetBrains Mono` | 400–500 |

```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

---

## Layout Principles

- Left-aligned content, not centered hero layouts
- Single column on mobile, 2-col on desktop (sidebar + main)
- `border-radius: 8px` on cards — no excessive rounding
- Cards: `border: 1px solid var(--border)` + glow on hover
- Sections separated by `1px` horizontal rules

---

## Component Specs (Build Order)

### 1. 🟢 Learning Path Stage Card (build first)

```
┌─────────────────────────────────────────────┐
│  Stage 01 — Foundations            [2/4 ✓]  │
│  ▓▓▓▓▓▓▓░░░░░░░░  50%                       │
│  ─────────────────────────────────────────  │
│  📄 Article Title                      8m   │
│     source.com                              │
│     ✦ Why this? Tailored reason here.       │
│  [ ] Mark as read               [→ Open]    │
└─────────────────────────────────────────────┘
```

- Stage number in `--accent-primary`, `Syne 800`
- Progress bar: `4px` height, animated fill, purple → green gradient
- Article left border: `3px solid var(--border)` → `--accent-green` when read
- "Why this?" in `--accent-yellow`, italic, `text-sm`
- Completed article: text fades to `--text-muted`
- Hover: bg lifts to `--bg-elevated`, left border flashes purple

### 2. 🟢 Profile Chip

- Horizontal: `32px` avatar circle + `@username` + top 3 tag pills
- Tag pills: `bg-elevated`, `border`, monospace, `text-xs`
- Sticky at top of path page

### 3. 🟢 Overall Progress Bar

- Larger `8px` bar at top of path
- Label: `X of Y articles completed`
- Animated on load and on article completion

### 4. 🟢 Share Bar

- 3 buttons: X (Twitter), LinkedIn, Copy Link
- Inline at bottom of path, and sticky on mobile
- Copy Link: shows "Copied!" feedback for 2s

### 5. 🟢 Navigation Bar

- Fixed top, `backdrop-filter: blur(12px)`
- Left: "DevPath" wordmark (`Syne 800`)
- Right: avatar chip (if logged in) or "Connect" button
- Height: 56px, `border-bottom: 1px solid var(--border)`

### 6. 🟡 Landing Hero (build after path page)

- Large `Syne 800` headline, 2 lines max
- Subtitle in `JetBrains Mono`, `--text-secondary`
- Single CTA pill button with `--accent-primary` fill
- Background: very subtle animated mesh gradient (low opacity blobs)

### 7. 🟡 Circuit Path Visualization (desktop sidebar)

- SVG vertical line connecting stage nodes
- Filled circle per stage, turns `--accent-green` when stage complete
- Active stage node pulses with `--accent-primary` glow
- Hidden on mobile to save build time

### 8. 🔴 OG Card (stretch goal)

- `1200×630px`, dark bg, mesh gradient
- Large path title (`Syne 800`)
- `@username` + avatar
- Top 3 article titles
- DevPath + daily.dev branding bottom right

---

## Motion (Minimal but Intentional)

| Element | Animation | Duration |
|---|---|---|
| Article completion | Left border color transition + green flash | 300ms |
| Progress bar fill | Width transition on mount + on change | 500ms ease |
| Stage node completion | Scale pulse + color fill | 400ms |
| Page load | Staggered fade-up on cards (50ms delay each) | 200ms each |
| CTA button | Glow pulse on idle (ambient) | 3s loop |

> **72h note:** Skip elaborate animations if running low on time. The progress bar transition and article completion color change are the minimum — they make the app feel alive.

---

## Loading State (Generate Page)

Typewriter effect cycling through these messages:

```
Analyzing your profile...
Reading your saved articles...
Mapping your knowledge gaps...
Curating your path with AI...
Almost there...
```

- Each message fades in/out every 2–3 seconds
- Monospace font, `--accent-primary` color
- Blinking cursor at end of each line

---

## Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| Mobile `< 768px` | Single column, circuit sidebar hidden, share bar sticky bottom |
| Tablet `768–1024px` | Single column, compact cards |
| Desktop `> 1024px` | 2-col: 280px sidebar (circuit + profile) + main content |

---

## Empty & Error States

| State | Message |
|---|---|
| No bookmarks | "You haven't saved any articles yet. Head to daily.dev to bookmark some!" |
| Path not found | "This path doesn't exist or has expired." + link to generate |
| AI error | "Something went wrong generating your path. Try again?" + retry button |
| Not logged in on `/generate` | Redirect to `/` with "Connect first" message |

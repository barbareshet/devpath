import OpenAI from "openai";
import type { UserProfile, CandidateArticle, BackgroundAnswers } from "@/types";

export function buildSuggestionSystemPrompt(): string {
  return `You are DevPath, a learning path curator for software developers.
Given a developer's profile and feed data, suggest exactly 3 distinct, highly personalized
learning path topics based on their actual bookmarks, followed tags, and reading history.
Be specific — avoid generic topics like "JavaScript basics". Tailor each suggestion to THIS
developer's actual interests and gaps. Respond ONLY with valid JSON.`;
}

export function buildSuggestionUserPrompt(
  profile: UserProfile,
  candidates: CandidateArticle[]
): string {
  // Compute top tag frequencies across the candidate pool
  const tagFreq = new Map<string, number>();
  candidates.forEach((c) =>
    c.tags.forEach((t) => tagFreq.set(t, (tagFreq.get(t) ?? 0) + 1))
  );
  const topTags = [...tagFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([t, count]) => `${t} (${count})`);

  return `Developer Profile:
- Username: @${profile.username}
- Tech Stack: ${profile.techStack.join(", ") || "Not specified"}
- Followed Tags: ${profile.followedTags.join(", ") || "None"}
- Bookmarks: ${profile.bookmarkIds.length} bookmarked articles
- Top tags in their feed: ${topTags.join(", ")}
- Total articles in feed: ${candidates.length}

Suggest exactly 3 distinct learning path topics for this developer. Make them specific and tailored to their actual data above.

Required JSON structure:
{
  "suggestions": [
    {
      "topic": "specific topic name (4–7 words)",
      "description": "1–2 sentences explaining why this fits THIS developer based on their actual tags/bookmarks",
      "emoji": "single relevant emoji"
    }
  ]
}`;
}

export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({ apiKey });
}

export function buildSystemPrompt(): string {
  return `You are DevPath, an intelligent learning path curator for software developers.

You receive a developer's daily.dev profile and a pool of articles. Your job is to
organize those articles into a structured, personalized learning path — ordered from
foundational to advanced — that reflects where this specific developer is right now
and where they want to grow.

Be specific. Reference the developer's actual tags, stack, and interests in your "why"
explanations. Avoid generic statements like "this is a great article" — explain why it
fits THIS person.

Respond ONLY with valid JSON matching the specified structure.`;
}

export function buildUserPrompt(
  profile: UserProfile,
  candidates: CandidateArticle[],
  topicOverride?: string,
  background?: BackgroundAnswers
): string {
  const bookmarkSet = new Set(profile.bookmarkIds);

  const articleList = candidates.map((a) => ({
    id: a.id,
    title: a.title,
    source: a.source,
    tags: a.tags,
    readTime: a.readTime,
    summary: a.summary,
    isBookmarked: bookmarkSet.has(a.id),
  }));

  const backgroundSection = background
    ? `
Developer Background (self-reported):
- Experience: ${background.experience}
- Primary Role: ${background.role}
- Learning Goal: ${background.goal}
- Learning Style: ${background.learningStyle}${background.challenge ? `\n- Biggest Challenge: ${background.challenge}` : ""}
`
    : "";

  return `Developer Profile:
- Username: @${profile.username}
- Bio: ${profile.bio ?? "Not provided"}
- Tech Stack: ${profile.techStack.join(", ") || "Not specified"}
- Followed Tags: ${profile.followedTags.join(", ") || "Not specified"}
- Bookmarked Article IDs: ${profile.bookmarkIds.join(", ") || "None"}
${topicOverride ? `- Focus Topic: ${topicOverride}\n` : ""}${backgroundSection}
Article Pool (${candidates.length} articles):
${JSON.stringify(articleList, null, 2)}

Instructions:
1. Select 12–18 articles from the pool above
2. Use article IDs EXACTLY as provided — never invent or modify IDs
3. Group into 3–5 stages ordered foundational → advanced
4. Prioritize bookmarked articles (isBookmarked: true) — include at least 3 if relevant
5. Each article needs a personalized "why" explanation (1–2 sentences) referencing this developer's specific stack, tags, or interests
6. Path title format: "Your Path to [Topic], @${profile.username}"

Required JSON structure:
{
  "pathTitle": "string",
  "pathSummary": "string (2–3 sentences describing the overall arc)",
  "estimatedTotalMinutes": number,
  "stages": [
    {
      "id": "stage-1",
      "title": "string",
      "description": "string",
      "articles": [
        {
          "articleId": "exact-id-from-pool",
          "why": "personalized reason string"
        }
      ]
    }
  ]
}`;
}

"use server";

import { openai, buildSystemPrompt, buildUserPrompt } from "@/lib/openai";
import { generateSlug } from "@/lib/slugify";
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
  const parsed = JSON.parse(raw) as GeneratedPath;

  if (!Array.isArray(parsed.stages) || parsed.stages.length === 0) {
    throw new Error("Invalid path structure returned from OpenAI");
  }

  // Filter + hydrate: attach full article data to each reference
  const candidatesMap = new Map(candidates.map((c) => [c.id, c]));
  parsed.stages = parsed.stages.map((stage) => ({
    ...stage,
    articles: stage.articles
      .filter((a) => candidatesMap.has(a.articleId))
      .map((a) => ({ ...a, article: candidatesMap.get(a.articleId) })),
  }));

  const slug = generateSlug(profile.username, parsed.stages[0].title);

  return { slug, path: parsed };
}

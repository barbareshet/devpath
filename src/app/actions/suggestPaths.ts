"use server";

import { buildCandidatePool } from "@/lib/dailydev";
import {
  createOpenAIClient,
  buildSuggestionSystemPrompt,
  buildSuggestionUserPrompt,
} from "@/lib/openai";
import type { PathSuggestion } from "@/types";

export async function suggestPaths(
  token: string,
  openaiKey: string
): Promise<PathSuggestion[]> {
  const { profile, candidates } = await buildCandidatePool(token);

  if (candidates.length < 5) {
    throw new Error(
      "Not enough articles found in your daily.dev profile. Try bookmarking some articles first."
    );
  }

  const openai = createOpenAIClient(openaiKey);
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 400,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSuggestionSystemPrompt() },
      { role: "user", content: buildSuggestionUserPrompt(profile, candidates) },
    ],
  });

  const raw = response.choices[0].message.content ?? "{}";
  const parsed = JSON.parse(raw) as { suggestions?: PathSuggestion[] };

  if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length === 0) {
    throw new Error("Could not generate suggestions. Please try again.");
  }

  return parsed.suggestions.slice(0, 3);
}

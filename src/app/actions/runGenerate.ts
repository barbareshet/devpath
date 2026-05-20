"use server";

import { buildCandidatePool } from "@/lib/dailydev";
import { generatePath } from "./generatePath";
import type { GeneratedPath } from "@/types";

export async function runGenerate(
  token: string,
  topicOverride?: string
): Promise<{ slug: string; path: GeneratedPath }> {
  const { profile, candidates } = await buildCandidatePool(token);

  if (candidates.length < 5) {
    throw new Error(
      "Not enough articles found in your daily.dev profile. Try bookmarking some articles first."
    );
  }

  return generatePath(profile, candidates, topicOverride);
}

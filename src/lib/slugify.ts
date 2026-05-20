import { nanoid } from "nanoid";

export function generateSlug(username: string, stageTitle: string): string {
  const topicSlug = stageTitle
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return `${username}-${topicSlug}-${nanoid(6)}`;
}

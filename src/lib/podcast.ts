import { z } from "zod";

export const podcastTopicSchema = z
  .string()
  .trim()
  .min(1, "Enter a podcast topic to get started.")
  .max(500, "Keep your podcast topic under 500 characters.");

export const podcastRequestSchema = z.object({ text: podcastTopicSchema });

export function createPodcastWebhookPayload(topic: string) {
  return { text: podcastTopicSchema.parse(topic) };
}

export function parsePodcastAudioResponse(value: unknown): string {
  const response = z
    .object({ audioFile: z.string().url().max(2048) })
    .parse(value);
  const audioUrl = new URL(response.audioFile);

  if (audioUrl.protocol !== "https:" || audioUrl.username || audioUrl.password) {
    throw new Error("The podcast response must include a secure audio link.");
  }

  return audioUrl.href;
}
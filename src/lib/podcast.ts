import { z } from "zod";

export const DEFAULT_PODCAST_WEBHOOK_URL =
  "https://f90a-160-30-36-71.ngrok-free.app/webhook-test/0a19b3a7-0956-4d86-a19d-a7adf799990c";

export const podcastTopicSchema = z
  .string()
  .trim()
  .min(1, "Enter a podcast topic to get started.")
  .max(500, "Keep your podcast topic under 500 characters.");

export const webhookUrlSchema = z
  .string()
  .trim()
  .url("Please enter a valid URL.")
  .max(2048, "Webhook URL must be under 2048 characters.")
  .refine(
    (url) => url.startsWith("https://") || url.startsWith("http://"),
    "Webhook URL must start with http:// or https://",
  );

export const podcastRequestSchema = z.object({
  text: podcastTopicSchema,
  webhookUrl: webhookUrlSchema.optional(),
});

export function createPodcastWebhookPayload(topic: string) {
  return { text: podcastTopicSchema.parse(topic) };
}

export function validateWebhookUrl(url: string) {
  return webhookUrlSchema.safeParse(url);
}

export function parsePodcastAudioResponse(value: unknown): string {
  const response = z.object({ audioFile: z.string().url().max(2048) }).parse(value);
  const audioUrl = new URL(response.audioFile);

  if (audioUrl.protocol !== "https:" || audioUrl.username || audioUrl.password) {
    throw new Error("The podcast response must include a secure audio link.");
  }

  return audioUrl.href;
}

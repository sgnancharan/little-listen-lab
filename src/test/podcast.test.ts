import { describe, expect, it } from "vitest";

import {
  createPodcastWebhookPayload,
  parsePodcastAudioResponse,
  podcastRequestSchema,
  podcastTopicSchema,
  validateWebhookUrl,
  webhookUrlSchema,
} from "@/lib/podcast";

describe("podcast generation input and response", () => {
  it("sends the topic in the webhook's expected text field", () => {
    expect(createPodcastWebhookPayload("The secret life of octopuses")).toEqual({
      text: "The secret life of octopuses",
    });
  });

  it("accepts topics with a maximum length of 500 characters", () => {
    expect(podcastTopicSchema.safeParse("a".repeat(500)).success).toBe(true);
    expect(podcastTopicSchema.safeParse("a".repeat(501)).success).toBe(false);
  });

  it("validates webhook URLs correctly", () => {
    expect(validateWebhookUrl("https://abc-123.ngrok-free.app/webhook-test/endpoint").success).toBe(
      true,
    );
    expect(validateWebhookUrl("http://localhost:3000/webhook").success).toBe(true);
    expect(validateWebhookUrl("not-a-valid-url").success).toBe(false);
    expect(validateWebhookUrl("ftp://example.com/webhook").success).toBe(false);
  });

  it("accepts an optional webhookUrl in podcastRequestSchema", () => {
    const withWebhook = podcastRequestSchema.safeParse({
      text: "AI and art",
      webhookUrl: "https://my-ngrok.ngrok-free.app/webhook",
    });
    expect(withWebhook.success).toBe(true);

    const withoutWebhook = podcastRequestSchema.safeParse({
      text: "AI and art",
    });
    expect(withoutWebhook.success).toBe(true);

    const invalidWebhook = podcastRequestSchema.safeParse({
      text: "AI and art",
      webhookUrl: "bad-url",
    });
    expect(invalidWebhook.success).toBe(false);
  });

  it("accepts a secure audioFile URL from the webhook response", () => {
    expect(parsePodcastAudioResponse({ audioFile: "https://audio.example/podcast.mp3" })).toBe(
      "https://audio.example/podcast.mp3",
    );
    expect(() => parsePodcastAudioResponse({ audioFile: "javascript:alert(1)" })).toThrow();
  });
});

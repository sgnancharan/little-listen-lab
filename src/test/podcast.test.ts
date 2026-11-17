import { describe, expect, it } from "vitest";

import {
  createPodcastWebhookPayload,
  parsePodcastAudioResponse,
  podcastTopicSchema,
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

  it("accepts a secure audioFile URL from the webhook response", () => {
    expect(parsePodcastAudioResponse({ audioFile: "https://audio.example/podcast.mp3" })).toBe(
      "https://audio.example/podcast.mp3",
    );
    expect(() => parsePodcastAudioResponse({ audioFile: "javascript:alert(1)" })).toThrow();
  });
});
import { createServerFn } from "@tanstack/react-start";

import {
  DEFAULT_PODCAST_WEBHOOK_URL,
  parsePodcastAudioResponse,
  podcastRequestSchema,
} from "@/lib/podcast";

export const generatePodcast = createServerFn({ method: "POST" })
  .validator((data: unknown) => podcastRequestSchema.parse(data))
  .handler(async ({ data }) => {
    const targetWebhookUrl = data.webhookUrl || DEFAULT_PODCAST_WEBHOOK_URL;
    try {
      const response = await fetch(targetWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ text: data.text }),
        signal: AbortSignal.timeout(90_000),
      });

      if (!response.ok) {
        console.warn("Podcast webhook returned an unsuccessful status:", response.status);
        return {
          ok: false as const,
          error: `Webhook returned status ${response.status}`,
        };
      }

      const audioFile = parsePodcastAudioResponse(await response.json());
      return { ok: true as const, audioFile };
    } catch (error) {
      console.warn("Podcast generation failed:", error);
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : "Failed to connect to webhook",
      };
    }
  });

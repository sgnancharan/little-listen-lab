import { createServerFn } from "@tanstack/react-start";

import { parsePodcastAudioResponse, podcastRequestSchema } from "@/lib/podcast";

const PODCAST_WEBHOOK_URL =
  "https://a86b-160-30-36-71.ngrok-free.app/webhook-test/0a19b3a7-0956-4d86-a19d-a7adf799990c";

export const generatePodcast = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => podcastRequestSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const response = await fetch(PODCAST_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(90_000),
      });

      if (!response.ok) {
        console.warn("Podcast webhook returned an unsuccessful status:", response.status);
        return { ok: false as const };
      }

      const audioFile = parsePodcastAudioResponse(await response.json());
      return { ok: true as const, audioFile };
    } catch (error) {
      console.warn("Podcast generation failed:", error);
      return { ok: false as const };
    }
  });
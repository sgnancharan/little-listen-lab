import { useServerFn } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Headphones, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import podcastStudio from "@/assets/podcast-studio.jpg";
import { generatePodcast } from "@/lib/podcast.functions";
import { podcastTopicSchema } from "@/lib/podcast";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Podcaster — your next favorite podcast starts here" },
      {
        name: "description",
        content: "Turn a topic you love into a podcast made just for you.",
      },
      { property: "og:title", content: "Podcaster — your next favorite podcast starts here" },
      {
        property: "og:description",
        content: "Turn a topic you love into a podcast made just for you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PodcastStudio,
});

function PodcastStudio() {
  const generate = useServerFn(generatePodcast);
  const [topic, setTopic] = useState("");
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<"idle" | "ready" | "error">("idle");
  const [validationMessage, setValidationMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedTopic = podcastTopicSchema.safeParse(topic);
    if (!parsedTopic.success) {
      setValidationMessage(parsedTopic.error.issues[0]?.message ?? "Enter a podcast topic.");
      setStatus("error");
      return;
    }

    setValidationMessage("");
    setStatus("idle");
    setAudioFile(null);
    setIsGenerating(true);

    try {
      const result = await generate({ data: { text: parsedTopic.data } });
      if (!result.ok) {
        setStatus("error");
        return;
      }

      setAudioFile(result.audioFile);
      setTopic("");
      setStatus("ready");
    } catch {
      setStatus("error");
    } finally {
      setIsGenerating(false);
    }
  }

  const playerMessage =
    status === "error"
      ? validationMessage || "Oops! Something went wrong. Please try again"
      : status === "ready"
        ? "Podcast is ready! Click play to listen"
        : "Podcast will appear here.";

  return (
    <main className="podcast-shell">
      <header className="podcast-topbar">
        <a className="podcast-brand" href="#home" aria-label="Podcaster home">
          <span className="brand-mark" aria-hidden="true">
            <Headphones size={17} strokeWidth={2.4} />
          </span>
          <span>Podcaster</span>
        </a>
        <span className="topbar-note">
          <span className="online-dot" aria-hidden="true" />
          Your little corner of audio
        </span>
      </header>

      <section className="studio-layout" id="home" aria-labelledby="studio-title">
        <div className="studio-copy">
          <p className="studio-kicker">
            <Sparkles size={15} strokeWidth={1.9} /> YOUR IDEAS, ON AIR
          </p>
          <h1 id="studio-title">
            Make a little
            <br />
            <span>listening magic.</span>
          </h1>
          <p className="studio-description">
            Dream up a topic. We’ll turn it into a podcast made just for you.
          </p>

          <form className="topic-form" onSubmit={handleSubmit}>
            <label htmlFor="podcast-topic">What shall we talk about?</label>
            <div className="topic-field-wrap">
              <input
                autoComplete="off"
                id="podcast-topic"
                maxLength={500}
                name="topic"
                onChange={(event) => {
                  setTopic(event.target.value);
                  if (status === "error") setStatus("idle");
                  if (validationMessage) setValidationMessage("");
                }}
                placeholder="Type podcast topic here ..."
                value={topic}
                disabled={isGenerating}
                aria-describedby="topic-hint"
              />
              <span className="input-ornament" aria-hidden="true">
                <Sparkles size={17} />
              </span>
            </div>
            <p className="topic-hint" id="topic-hint">
              From big questions to tiny curiosities.
            </p>
            <Button
              className="generate-button"
              disabled={isGenerating || !topic.trim()}
              type="submit"
            >
              <span aria-hidden="true">🎙️</span>
              {isGenerating ? "Making your podcast…" : "Generate Podcast"}
              {!isGenerating && <ArrowUpRight size={17} aria-hidden="true" />}
            </Button>
          </form>

          <section className="player-section" aria-labelledby="player-title">
            <div className="player-heading-row">
              <div>
                <p className="player-eyebrow">YOUR LISTENING NOOK</p>
                <h2 id="player-title">A new little episode</h2>
              </div>
              <span className="headphone-stamp" aria-hidden="true">
                <Headphones size={19} strokeWidth={1.9} />
              </span>
            </div>

            <div
              className={`audio-panel ${status === "error" ? "audio-panel-error" : ""}`}
              aria-live="polite"
              aria-busy={isGenerating}
            >
              {isGenerating ? (
                <div className="loading-state">
                  <span className="loading-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>Creating podcast... please wait!</span>
                </div>
              ) : audioFile && status === "ready" ? (
                <div className="ready-state">
                  <p className="player-message success-message">{playerMessage}</p>
                  <audio aria-label="Generated podcast audio player" controls src={audioFile} />
                </div>
              ) : (
                <div className="empty-state">
                  <span className="audio-empty-icon" aria-hidden="true">
                    <Headphones size={20} strokeWidth={1.8} />
                  </span>
                  <p className={`player-message ${status === "error" ? "error-message" : ""}`}>
                    {playerMessage}
                  </p>
                  <span className="empty-wave" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="studio-art" aria-label="Podcast microphone and headphones illustration">
          <span className="art-caption">
            <span className="caption-sparkle" aria-hidden="true">✳</span>
            a show of your own
          </span>
          <img
            alt="A cheerful vintage microphone and sunny yellow headphones"
            height={1024}
            src={podcastStudio}
            width={1024}
            fetchPriority="high"
          />
          <div className="art-note">
            <span className="note-heart" aria-hidden="true">♡</span>
            Made for your curious mind
          </div>
          <span className="floating-sparkle" aria-hidden="true">✦</span>
          <span className="floating-dot" aria-hidden="true" />
        </aside>
      </section>

      <footer className="podcast-footer">
        <span>A new perspective, one play at a time.</span>
        <span className="footer-flower" aria-hidden="true">✿</span>
      </footer>
    </main>
  );
}
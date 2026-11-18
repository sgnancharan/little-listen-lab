import { useServerFn } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Check, Headphones, Link2, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import podcastStudio from "@/assets/podcast-studio.jpg";
import { generatePodcast } from "@/lib/podcast.functions";
import { DEFAULT_PODCAST_WEBHOOK_URL, podcastTopicSchema, validateWebhookUrl } from "@/lib/podcast";

const LOCAL_STORAGE_WEBHOOK_KEY = "podcaster_webhook_url";

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

  // Webhook configuration state
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [isWebhookOpen, setIsWebhookOpen] = useState(false);
  const [tempWebhookUrl, setTempWebhookUrl] = useState("");
  const [webhookError, setWebhookError] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_STORAGE_WEBHOOK_KEY);
      if (saved) {
        setWebhookUrl(saved);
        setTempWebhookUrl(saved);
      } else {
        setTempWebhookUrl(DEFAULT_PODCAST_WEBHOOK_URL);
      }
    }
  }, []);

  function handleOpenWebhookDialog(open: boolean) {
    setIsWebhookOpen(open);
    if (open) {
      setTempWebhookUrl(webhookUrl || DEFAULT_PODCAST_WEBHOOK_URL);
      setWebhookError("");
      setIsSaved(false);
    }
  }

  function handleSaveWebhook() {
    const trimmed = tempWebhookUrl.trim();
    if (!trimmed) {
      handleResetWebhook();
      return;
    }

    const validation = validateWebhookUrl(trimmed);
    if (!validation.success) {
      setWebhookError(
        validation.error.issues[0]?.message || "Invalid URL. Please enter a valid HTTP/HTTPS URL.",
      );
      setIsSaved(false);
      return;
    }

    setWebhookError("");
    setWebhookUrl(trimmed);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_WEBHOOK_KEY, trimmed);
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsWebhookOpen(false);
      setIsSaved(false);
    }, 700);
  }

  function handleResetWebhook() {
    setWebhookUrl("");
    setTempWebhookUrl(DEFAULT_PODCAST_WEBHOOK_URL);
    setWebhookError("");
    setIsSaved(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_WEBHOOK_KEY);
    }
  }

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
      const result = await generate({
        data: {
          text: parsedTopic.data,
          ...(webhookUrl ? { webhookUrl } : {}),
        },
      });

      if (!result.ok) {
        setStatus("error");
        setValidationMessage(
          "Oops! Something went wrong. Please check your webhook URL in the top-right settings and try again.",
        );
        return;
      }

      setAudioFile(result.audioFile);
      setTopic("");
      setStatus("ready");
    } catch {
      setStatus("error");
      setValidationMessage("Oops! Something went wrong. Please try again.");
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

        <div className="topbar-actions">
          <span className="topbar-note">
            <span className="online-dot" aria-hidden="true" />
            Your little corner of audio
          </span>

          <Dialog open={isWebhookOpen} onOpenChange={handleOpenWebhookDialog}>
            <DialogTrigger asChild>
              <button
                type="button"
                className={`webhook-trigger-btn ${webhookUrl ? "has-custom" : ""}`}
                aria-label="Configure Webhook URL"
                title={
                  webhookUrl
                    ? `Custom Webhook active: ${webhookUrl}`
                    : "Configure Webhook URL (ngrok tunnel)"
                }
              >
                <Link2 size={16} strokeWidth={2.2} />
                <span className="webhook-status-dot" aria-hidden="true" />
              </button>
            </DialogTrigger>
            <DialogContent className="webhook-dialog-card">
              <DialogHeader>
                <div className="webhook-dialog-header-badge">
                  <span className="webhook-badge-icon">
                    <Link2 size={18} strokeWidth={2.2} />
                  </span>
                  <div>
                    <DialogTitle className="webhook-dialog-title">
                      Webhook Configuration
                    </DialogTitle>
                    <DialogDescription className="webhook-dialog-desc">
                      Using a free ngrok tunnel? Paste your current ngrok URL below. It will be
                      saved locally in your browser for podcast generation.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="webhook-dialog-body">
                <div className="webhook-input-group">
                  <label htmlFor="webhook-url-input" className="webhook-label">
                    Active Webhook URL
                  </label>
                  <Input
                    id="webhook-url-input"
                    type="url"
                    placeholder="https://xxxx.ngrok-free.app/webhook-test/..."
                    value={tempWebhookUrl}
                    onChange={(e) => {
                      setTempWebhookUrl(e.target.value);
                      if (webhookError) setWebhookError("");
                      if (isSaved) setIsSaved(false);
                    }}
                    className={`webhook-input ${webhookError ? "webhook-input-error" : ""}`}
                  />
                  {webhookError && <p className="webhook-error-text">{webhookError}</p>}
                  {isSaved && (
                    <p className="webhook-success-text">
                      <Check size={14} /> Webhook URL saved successfully!
                    </p>
                  )}
                </div>

                <div className="webhook-default-box">
                  <div className="webhook-default-header">
                    <span className="webhook-default-title">Default Webhook</span>
                    <button
                      type="button"
                      className="webhook-use-default-btn"
                      onClick={() => {
                        setTempWebhookUrl(DEFAULT_PODCAST_WEBHOOK_URL);
                        setWebhookError("");
                        setIsSaved(false);
                      }}
                    >
                      Paste default
                    </button>
                  </div>
                  <code className="webhook-default-code">{DEFAULT_PODCAST_WEBHOOK_URL}</code>
                </div>

                {webhookUrl ? (
                  <div className="webhook-active-tag">
                    <span className="webhook-tag-dot" />
                    <span>Custom webhook active</span>
                  </div>
                ) : (
                  <div className="webhook-default-tag">
                    <span>Using default webhook URL</span>
                  </div>
                )}
              </div>

              <DialogFooter className="webhook-dialog-footer">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetWebhook}
                  disabled={!webhookUrl && tempWebhookUrl === DEFAULT_PODCAST_WEBHOOK_URL}
                  className="webhook-reset-btn"
                >
                  <RotateCcw size={13} />
                  Reset to Default
                </Button>
                <div className="webhook-action-buttons">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsWebhookOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveWebhook}
                    className="webhook-save-btn"
                  >
                    Save Webhook
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
            <span className="caption-sparkle" aria-hidden="true">
              ✳
            </span>
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
            <span className="note-heart" aria-hidden="true">
              ♡
            </span>
            Made for your curious mind
          </div>
          <span className="floating-sparkle" aria-hidden="true">
            ✦
          </span>
          <span className="floating-dot" aria-hidden="true" />
        </aside>
      </section>

      <footer className="podcast-footer">
        <span>A new perspective, one play at a time.</span>
        <span className="footer-flower" aria-hidden="true">
          ✿
        </span>
      </footer>
    </main>
  );
}

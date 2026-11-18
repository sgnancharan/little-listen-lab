# Podcaster — Little Listen Lab

Turn any topic you love into a podcast episode made just for you.

## Features

- **Topic Input:** Enter any topic (up to 500 characters) to generate an episode.
- **Dynamic Webhook Configuration:** Configure your active webhook / ngrok tunnel URL via the chain-link icon in the top right corner. Useful when using free ngrok tunnels whose URL changes across restarts.
- **Audio Playback:** Plays back generated audio directly in the browser when ready.
- **Responsive & Accessible Design:** Built with soft pastel accents, accessible buttons, and responsive layout for desktop and mobile.

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm

### Installation

```sh
npm install
```

### Development Server

```sh
npm run dev
```

### Running Tests

```sh
npm test
```

## Webhook Integration

The application sends a `POST` request to the configured webhook endpoint with:

```json
{
  "text": "The topic you typed"
}
```

The endpoint is expected to respond with:

```json
{
  "audioFile": "https://example.com/audio.mp3"
}
```

You can update the webhook endpoint at any time directly in the app via the link icon in the top right corner.

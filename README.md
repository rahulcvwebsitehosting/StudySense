# StudySense

**A privacy-first, browser-only AI study companion** that monitors your mood, posture, and focus — entirely on-device. No accounts, no uploads, no tracking.

## Features

- **Live session dashboard** (`pages/Session.tsx` + `components/WebcamMonitor.tsx`) — a single view with the webcam, timer, and real-time metrics (mood, posture, focus, distraction).
- **Smart coaching** (`components/MiniCoach.tsx`) — contextual tips react to your detected mood and focus in real time.
- **Voice notes** (`components/VoiceNoteTaker.tsx`) — hands-free capture via your microphone.
- **AI assistance** (`services/aiService.ts`) — Gemini-powered note refinement, mood reflection, study tutoring, and in-app support chat (`AppSupportChat.tsx`).
- **Session history & summaries** (`pages/Summary.tsx` + `services/storage.ts`) — stats, charts, and reflections, saved locally.
- **Focus & posture tracking** (`services/faceService.ts`) — on-device detection; no video leaves your browser.

## Tech stack

- **Frontend** — React 18, TypeScript 5, Vite, Tailwind CSS.
- **AI** — `@google/genai` (Gemini) and face-api.js for on-device expression detection.

## Run locally

```bash
npm install
npm run dev
```

Set your Gemini API key via `API_KEY` (see `vite.config.ts`, which loads it from the environment).

## Build

```bash
npm run build
```

## Project structure

```
components/   UI components (WebcamMonitor, MiniCoach, VoiceNoteTaker, AppSupportChat, ...)
hooks/        Custom hooks (usePosture)
lib/          Helper logic (moodMap)
pages/        Dashboard, Session, Summary, About, LinkedinRedirect
services/     aiService, faceService, storage
__tests__/    Tests
```

## Honest limitations

- Everything runs client-side; there is no backend. Session data lives in your browser's local storage — clearing site data erases it.
- Camera and microphone access are requested in-browser and are optional.
- The face-api models load from a CDN and Gemini calls require an internet connection.

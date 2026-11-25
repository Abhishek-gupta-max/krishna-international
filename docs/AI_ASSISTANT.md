# Krishna AI Recruitment Assistant

A floating **"Talk to Krishna AI"** assistant on every public page (not in the admin panel). It explains the company's recruitment services, guides employers to the enquiry form and candidates to the registration form, and supports voice in English and Hindi.

## What it costs

Nothing. There are no API keys, no paid services and no new npm packages.

| Part | How it works |
| --- | --- |
| Answers | **Demo mode:** a small on-device engine that answers from this website's own data (see below). It is not a language model, and the window says so. |
| Voice input | The browser's Web Speech API (`SpeechRecognition`), in `en-IN` or `hi-IN`. It works in Chrome and Edge; in other browsers the mic shows a "not supported, please type" message. |
| Spoken replies | The browser's `speechSynthesis`. Visitors can mute it or press "Stop voice". |
| Avatar | An inline SVG with CSS animations. It's a robot with an "AI" badge, so it is never mistaken for a real employee. |

## Where the answers come from

The answers come only from data the website already has:

- `frontend/src/app/core/models/reference-data.ts`: services, sectors, process steps, why-choose-us points, job categories, countries in the form.
- Company settings from the API: phones, WhatsApp, email, address, contact person, MEA RC number and certificate.
- The candidates page document list, and the fields of the employer and candidate forms.
- **Live vacancies** from `GET /api/jobs`. If none are published, it says so.

It never states salaries, fees, vacancies or guarantees that are not on the site. Instead it tells the visitor that the recruitment team will confirm them. If a visitor types a phone number or email, it reminds them not to share personal details in the chat and to use the form instead. Chats are not stored or sent anywhere.

When you change content (for example services or the document list), update the same source files and the assistant follows automatically.

## Files

All the assistant code is isolated in `frontend/src/app/shared/components/ai-assistant/`:

| File | Purpose |
| --- | --- |
| `ai-assistant.component.*` | Launcher button and chat window: language toggle, mute, clear, minimize and close. |
| `ai-avatar.component.ts` | Animated SVG avatar with idle, listening, speaking and thinking states. |
| `website-knowledge.engine.ts` | The demo-mode answer engine (English, Hindi and Hinglish). |
| `remote-assistant.engine.ts` | An optional connector for a real model (see below). It falls back to demo mode. |
| `speech.service.ts` | Wraps voice input and output, with permission and compatibility messages. |
| `assistant.models.ts` | Shared types and the engine interface. |

The other files changed are:

- `layouts/public-layout/public-layout.component.ts`: adds `<app-ai-assistant />`, lazy-loaded with `@defer (on idle)`.
- `shared/components/icon/icon.component.ts`: adds the mic, send and volume icons.
- `environments/environment*.ts`: adds `assistantEndpoint: ''`.
- `features/home/home.component.scss`: the hero slider arrows moved to the left so they don't sit under the floating buttons.

## Run locally

```bash
npm run dev          # from the project root: API on :4000, website on :4200
```

Open http://localhost:4200 and click **Talk to Krishna AI**. The microphone needs `localhost` or HTTPS, and the visitor's permission.

## Deploy

There is nothing extra to configure. Commit, push to `main`, and Vercel builds the frontend as usual with `npm run build`.

## Connecting a real AI model later (optional)

The browser never talks to a model provider directly, so no keys ever reach the frontend.

1. Add a backend route, e.g. `POST /api/assistant`. It should accept `{ message, lang, history }` and return `{ reply, actions? }`. Inside it, call a free self-hosted model (for example Ollama running on your own server), and give it the same website facts as context.
2. Set `assistantEndpoint: '/api/assistant'` in `frontend/src/environments/environment.prod.ts`, and the local URL in `environment.ts`.
3. The header label changes from "Demo mode" automatically. If the endpoint fails or times out (20 seconds), the free demo engine answers instead.

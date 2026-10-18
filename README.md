# YOU AI — Personal AI Starter (v1)

YOU AI is a personal, mobile-friendly AI web app starter. It is designed to be edited from an Android phone and later wrapped/published as a mobile app.

## Included now
- Responsive chat UI in Hindi/English/Hinglish
- FastAPI backend
- Configurable OpenAI-compatible chat endpoint
- Installable PWA foundation (manifest + service worker)
- Health endpoint
- GitHub Actions syntax/compile check
- No API secret stored in frontend code

## Not included yet
- Real image/video generation, voice calls, code execution, login, or saved server-side history. These are planned modules, not active features yet.
- No AI model is bundled. AI responses need a provider endpoint and token, or a model server you operate.
- This starter is for personal testing. Do not expose it publicly with an unprotected AI endpoint; add authentication/rate limiting before public launch.

## Files
```text
you-ai/
├── app/main.py
├── static/index.html
├── static/styles.css
├── static/app.js
├── static/manifest.json
├── static/sw.js
├── .github/workflows/check.yml
├── .env.example
├── .gitignore
├── requirements.txt
├── Procfile
├── Dockerfile
└── README.md
```

## Recommended phone-only workflow
1. Create a GitHub repository named `you-ai`.
2. Upload the extracted files in this folder to the repository root.
3. On Android Chrome, open the repository and use GitHub's web UI to edit files. For terminal-based work, use GitHub Codespaces if included quota is available. GitHub documents a monthly free quota for personal accounts; check your current usage before relying on it.
4. Deploy the app to a Python-compatible host. Free tiers, sleep behavior, and limits vary.
5. Configure environment variables in the hosting dashboard, never in the frontend.

## Run locally (computer or Codespace)
```bash
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Then open `http://127.0.0.1:8000`.

## Configure an AI provider
Set these environment variables in the backend host:
- `AI_BASE_URL`: complete OpenAI-compatible chat completions endpoint, e.g. the provider's documented `/v1/chat/completions` endpoint.
- `AI_API_KEY`: token/key if required.
- `AI_MODEL`: exact model ID supported by that endpoint.
- `YOU_AI_NAME`: optional app title.
- `ALLOWED_ORIGINS`: comma-separated origins. Same-origin deployment usually only needs the app's own origin if you split frontend/backend.

Provider URLs and model IDs vary. Follow the chosen provider's current docs. Hugging Face Inference Providers offers a small free monthly credit for free accounts (currently documented as $0.10, subject to change), not unlimited free inference. After credits, paid usage requires purchasing credits. Keep the budget at ₹0 by stopping when the free quota is exhausted.

## PWA / mobile
The included manifest and service worker provide a basic installable web-app shell. This is not a native Android APK and does not make AI work offline. Installability requires HTTPS on the deployed website. For a native app later, use Expo/React Native with this same backend.

## Security checklist before any public deployment
- Keep repository private if the source contains private information.
- Never commit `.env`, access tokens, or provider keys.
- Configure authentication and rate limits before sharing the URL.
- Do not execute user-submitted code directly on the server.
- Review privacy and provider retention policies before sending personal files or chats.
- Keep AI provider spending disabled/limited if the provider supports it.

## Roadmap
1. Working text chat (this starter)
2. Login and private conversation storage
3. Image understanding/generation
4. Audio transcription and speech output
5. Sandboxed coding tools
6. Video understanding/generation (may need paid or scarce GPU resources)
7. Native Android/iOS app


## Zero-budget setup: Hugging Face

This starter can call Hugging Face's OpenAI-compatible router:
- Set `AI_BASE_URL=https://router.huggingface.co/v1`
- Set `AI_API_KEY` to a Hugging Face User Access Token stored only in the hosting platform's secret/environment settings.
- Set `AI_MODEL` to an exact chat model ID that currently supports the Inference Providers router.
- Never paste the token into chat, frontend files, or a public commit.

Hugging Face documents a small free monthly inference credit for free users (currently $0.10, subject to change). Additional usage requires purchasing credits; keep this project at ₹0 by not purchasing credits or enabling paid usage. When free credits are exhausted, requests may stop working until the next credit period.

### Host on Hugging Face Spaces (free CPU option)
1. Sign in to Hugging Face and create a new **Space** using the **Docker** SDK.
2. Choose a name such as `you-ai` and a public or private visibility as you prefer.
3. Add these files from this repository to the Space repository (or use the Space's Git instructions): `app/`, `static/`, `requirements.txt`, and `Dockerfile`.
4. In the Space's **Settings → Variables and secrets**, add `AI_BASE_URL`, `AI_MODEL`, and secret `AI_API_KEY`.
5. Wait for the Space build to finish, then open its URL and test a short chat.
6. Free CPU Spaces may sleep or have resource limits. Do not enable paid hardware.

The Space host and inference provider are separate: deploying the website does not automatically configure a model token. Keep all secrets in the host settings, not GitHub.

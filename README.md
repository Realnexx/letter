# A Letter for Her

An entirely static, mobile-first birthday keepsake built with React, TypeScript, Vite, Tailwind CSS, GSAP, Motion, Howler and locally bundled fonts.

## Run

```sh
npm install
npm run dev
npm run build
npm run preview
```

## Personalize before sharing

All five letters and recipient settings live in `src/data/messages.ts`. Current copy is explicitly sample content. Change `recipient`, `sender`, the five message bodies and signatures; set `isSample` to false only after replacing the samples. The memory chapter deliberately makes no claim about a real shared memory.

No personal photos, narration or licensed background music were supplied. These assets are not generated or silently substituted. Each chapter has a distinct intended voice direction; actual narrator voices require five real recordings.

1. Put approved recordings in `public/audio/`, then set each message's `audio` to a root-relative path such as `/audio/message-01.mp3`.
2. Supply verified sentence cues (`start`, `end`, `text`) in seconds for that recording. Do not estimate timestamps from text length. With cues, playback time highlights the spoken sentence; sentences can be clicked to seek. This is sentence synchronization, not word synchronization. Without cues the complete letter stays readable.
3. Add an approved music track and set `settings.backgroundAudio`. Music is optional and quieter than narration. Sound begins only after interaction.
4. Optionally add personal images to the memory message's `images` array, with descriptive alt text. Anything in `public` is publicly accessible after deployment: use only images approved for public sharing. Do not commit private originals.

The supplied seal, page and finale effects are small original synthesized tones using Web Audio; they are not physical paper recordings. Replace or extend `playEffect` with approved recordings for realistic foley.

## Interaction

Touch or keyboard-activate the wax seal to open the 3D envelope. Navigate five chapters using Previous/Next, the desktop chapter list, the All letters collection, or left/right arrow keys outside controls. Reading mode always makes text accessible. Cinematic mode emphasizes the paper and follows the active sentence when timing cues exist. Audio supports play, pause, seek and replay; recordings are released on chapter changes. Sound settings include global mute, volume, independent effect control and optional music. The finale can follow the last recording or be opened with One final wish; it offers collection access and a complete replay.

Reduced-motion preferences simplify the envelope and transitions and disable confetti. All fonts are bundled; no runtime API, database, credentials or external requests are required.

## Verification

```sh
npm run build
npx playwright test
```

Playwright uses a local production preview, exercises the envelope, all chapters, collection, settings, replay, keyboard navigation, mobile overflow and reduced motion. Browser binaries must be available (`npx playwright install chromium` if needed).

## Deploy to Vercel

Import this repository, use the Vite preset, build command `npm run build`, output `dist`. `vercel.json` supplies these settings. No environment variables are needed. Before sharing, verify the deployed URL on a phone and check the actual approved recordings, timing cues and image permissions. This project has not been published automatically.

## Printed QR gift card

Open `/gift-card.html` for Kimberly Ann's matching A6 gift-card studio. After publishing the website, paste its public HTTPS URL, create the QR code, then print/save PDF or download the card PNG and QR SVG. On a public HTTPS deployment the studio initializes with that site's home URL. Localhost, local-network addresses, and GitHub source-code links are rejected. The QR uses high error correction, a four-module white quiet zone, burgundy modules and no overlaid logo. The PNG is 1240 × 1748 pixels (A6 at approximately 300 dpi). A scannable final code cannot be created until the public website link exists. Always scan a printed proof before gifting.

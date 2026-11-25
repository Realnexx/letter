# A Letter for Her

A mobile-first birthday keepsake with a static frontend and optional Vercel email endpoint built with React, TypeScript, Vite, Tailwind CSS, GSAP, Motion, Howler and locally bundled fonts.

## Run

```sh
npm install
npm run dev
npm run build
npm run preview
```

## Personalize before sharing

All five letters and recipient settings live in `src/data/messages.ts`. Current copy is explicitly sample content. Change `recipient`, `sender`, the five message bodies and signatures; set `isSample` to false only after replacing the samples. The memory chapter deliberately makes no claim about a real shared memory.

All five letters now have supplied recordings, including my letter.mp3 for chapter 4. The supplied portrait and licensed instrumental playlist are bundled; see the music attribution section below. See the narration section below for timing provenance and file mapping.

1. Put approved recordings in `public/audio/`, then set each message's `audio` to a root-relative path such as `/audio/message-01.mp3`.
2. Supply verified sentence cues (`start`, `end`, `text`) in seconds for that recording. Do not estimate timestamps from text length. With cues, playback time highlights the spoken sentence; sentences can be clicked to seek. This is sentence synchronization, not word synchronization. Without cues the complete letter stays readable.
3. Configure approved playlist tracks in `src/data/music.ts` and preserve their attribution. Music is optional, quieter than narration, and pauses on the letters. Browser autoplay rules may require the first interaction.
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

Import this repository, use the Vite preset, build command `npm run build`, output `dist`. `vercel.json` supplies these settings. The core letter experience needs no environment variables. Email features need the server-only settings documented below. Before sharing, verify the deployed URL on a phone and check the actual approved recordings, timing cues and image permissions. This project has not been published automatically.

## Printed QR gift card

Open `/gift-card.html` for Kimberly Ann's matching 2 × 3.5 inch gift-card studio. After publishing the website, paste its public HTTPS URL, create the QR code, then print/save PDF or download the card PNG and QR SVG. On a public HTTPS deployment the studio initializes with that site's home URL. Localhost, local-network addresses, and GitHub source-code links are rejected. The QR uses high error correction, a four-module white quiet zone, burgundy modules and no overlaid logo. The PNG is 600 × 1050 pixels with embedded 300 DPI print metadata (2 × 3.5 inches). A scannable final code cannot be created until the public website link exists. Always scan a printed proof before gifting.

## Supplied narration and word highlighting

Recordings are bundled for chapters 1 (`vm1.mp3`), 2 (`vm2.mp3`), 3 (`vm4new.mp3`, matched by its actual spoken content), 4 (`vm4.mp3`, supplied as `my letter.mp3`), and 5 (`vm5.mp3`). No recordings are generated or reused over unrelated text.

`src/data/narration-words.json` contains word timestamps from local faster-whisper base.en transcription, aligned to the existing display text. Gold highlighting follows Howler's playback clock, including after seek, pause, resume and replay. These are automatic acoustic timings, not manually certified boundaries; a zero-duration ASR word is omitted rather than inventing its timing. Unspoken headings and signatures remain visible without an artificial highlight. Both reading and cinematic modes automatically bring the active spoken word into view during playback. Scrolling keeps a comfortable margin inside the visible viewport and stops following when narration is paused. Reduced motion preserves highlighting without animated transitions. Narration starts automatically when a recorded letter opens, preserving global mute and volume. The envelope opening is the initial interaction; a browser that still blocks audio shows a one-tap play fallback. Pausing holds playback until the reader resumes it or opens another letter.

To change recorded wording, replace the audio and regenerate its timing data together. Never stretch these cues to fit a new recording or estimate word positions from character counts. Temporary transcription libraries, models, and intermediate files stay in ignored `tmp/` and are not shipped or required by the static website.


## Gentle interaction sounds

`src/audio/soundEffects.ts` creates original, quiet procedural paper rustles for seal release, flap opening, letter extraction, unfolding and page turns, plus a soft three-note closing chime. Sound is enabled initially but nothing plays until a user interaction. The global volume/mute and independent sound-effects checkbox control these effects; narration uses its own playback path. Rapid interactions stop previous effects rather than stacking them. The audio nodes release themselves when finished, and active effects stop when muted, disabled or the experience unmounts. Letter content is unchanged; all five chapters now have recordings.



## Portrait introduction

The supplied portrait is optimized as `public/images/kimberly-ann.webp` and displayed uncropped on a dedicated introduction before the sealed envelope. The image is bundled with the static website; no external image service is used. The introduction respects reduced motion, works on narrow screens, and is included when replaying the complete experience.

## Background music

Three licensed instrumentals by Kevin MacLeod play sequentially and repeat: There is Romance, Heartwarming, and Dream Culture. Source links and CC BY 4.0 attribution are on `/music-credits.html` and linked from sound settings. Files are re-encoded to 96 kbps for lighter delivery and hosted locally. Only the current track is loaded. Music is enabled by default at low volume, attempts autoplay, and retries after the first tap if browser policy requires it. It pauses throughout the letters (including the collection and paused narration) and resumes from its previous position on the introduction, envelope, or finale. Global mute, volume, the music checkbox and Next track remain available. One failed track is skipped; if all fail, narration and the rest of the site remain usable.

## Visit notices and optional replies

FormSubmit handles email without a Resend account or API key. A small Vercel GET endpoint, api/contact.ts, supplies only an activated opaque FormSubmit address. The browser submits directly to its documented AJAX endpoint, because FormSubmit rejected Vercel server-to-server traffic with HTTP 403. The recipient's Gmail address stays out of the frontend and API response. The opaque form address is intentionally public, not an authentication secret.

Production configuration:
- FORMSUBMIT_FORM_ID: the random form identifier provided after activation, without an email address or URL.
- FORMSUBMIT_ACTIVATED: true after the recipient clicks Activate Form and a setup submission is acknowledged.

Both settings are configured on this project. The owner confirmed activation, and a clearly labeled browser test from the live website was acknowledged successfully. Legacy CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL, and CONTACT_SITE_URL are unused and may be removed. No Resend key is needed. Vite preview does not run Vercel functions; use vercel dev for local configuration, or mock GET /api/contact during UI testing.

The introduction discloses visit notices. A foreground visit lasting at least 1.5 seconds submits one notice per browser tab session. Session storage holds a random event ID and sent flag, not a cross-site identifier. Use ?preview=1 for owner checks without a visit notice. Visits do not prove identity: owner visits and automated browsers can also trigger notices. No identity, location, or device details are added to the visit message. FormSubmit receives the browser request directly and may process connection metadata under its privacy policy.

The finale offers an optional message, optional self-reported name, and explicit consent. The frontend validates length, preserves drafts on failure and accepts only FormSubmit's explicit success response, not an HTTP 200 alone. Messages are not published on the page. FormSubmit processes submissions and retains them for 30 days according to https://formsubmit.co/documentation . The site does not collect reply email addresses.

FormSubmit handles spam filtering, and a honeypot is included. The frontend disables duplicate sends while pending and deduplicates visit notices within a session. FormSubmit has no documented provider-wide idempotency key, so retries after an ambiguous network failure can duplicate a message. The configuration endpoint is GET-only; the site no longer claims server-side validation or rate limiting for direct submissions, and self-reported names remain unverified. Automated tests mock the provider and do not email real recipients.

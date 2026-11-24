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

Open `/gift-card.html` for Kimberly Ann's matching A6 gift-card studio. After publishing the website, paste its public HTTPS URL, create the QR code, then print/save PDF or download the card PNG and QR SVG. On a public HTTPS deployment the studio initializes with that site's home URL. Localhost, local-network addresses, and GitHub source-code links are rejected. The QR uses high error correction, a four-module white quiet zone, burgundy modules and no overlaid logo. The PNG is 1240 × 1748 pixels (A6 at approximately 300 dpi). A scannable final code cannot be created until the public website link exists. Always scan a printed proof before gifting.

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

The owner requested email notifications and an optional reply form. This adds one Vercel Node function, `api/contact.ts`; the rest of the experience remains static. It uses Resend over HTTPS. No database or visitor account is introduced. The recipient email and API key are server-only and never appear in the browser bundle.

Required **Production** Vercel environment variables:

- `CONTACT_TO_EMAIL`: the owner's destination email.
- `CONTACT_FROM_EMAIL`: an approved Resend sender. `Birthday Keepsake <onboarding@resend.dev>` works only for delivery to the verified owner of the Resend account. For other recipients, verify a sender domain.
- `CONTACT_SITE_URL`: the exact public origin, currently `https://letter-ten-theta.vercel.app`.
- `RESEND_API_KEY`: a Resend sending key. Never prefix it with `VITE_` or commit it. Set it privately in Vercel, then redeploy.

The first three settings are configured on the Vercel project. Email delivery is inactive until a valid Resend key is added and the app redeployed. The API reports `enabled:false` if configuration is incomplete; the form then states that replies are unavailable instead of pretending to send. Local Vite preview does not run Vercel functions; use `vercel dev` for end-to-end local backend work. Tests mock delivery and never send real email.

Once enabled, the introduction displays a visit notice. A foreground visit lasting at least 1.5 seconds triggers one notification per browser tab session. Session storage holds a random event ID and sent flag; there are no cross-site identifiers or fingerprinting. Provider idempotency suppresses duplicate submissions for 24 hours. `?preview=1` suppresses automatic visit notices for the owner's checks. Alerts do not establish identity: the owner's visits and automated browsers may also trigger them. No visitor location, IP or device details are sent in the emails.

At the finale, the optional form asks for a message, optional self-reported name, and explicit confirmation to send. It preserves drafts on failure, reports success only after provider acceptance, and uses idempotent retries. The name is not verified. Messages are delivered to the owner's inbox and processed by Resend; they are not published on the website or written to application logs.

The endpoint accepts same-origin JSON requests, validates message lengths, ignores a honeypot, and applies a bounded 15-minute in-memory hashed-IP rate guard. This is a per-instance abuse guard, not a distributed quota; production-wide limits can be added through Vercel Firewall if needed. Do not describe the endpoint as authenticated or the sender's identity as verified.

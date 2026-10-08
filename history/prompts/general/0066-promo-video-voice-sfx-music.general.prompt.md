---
id: 0066
title: Promo video voice, effects and music
stage: general
date: 2026-10-08
surface: agent
model: claude-opus-5-5
feature: none
branch: 011-tester-feedback
user: talhawork257
command: none
labels: ["marketing", "video", "remotion", "audio", "edge-tts"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - C:/Users/scs/Desktop/alnoor-promo-video/src/audio/voice-lines.json (new)
  - C:/Users/scs/Desktop/alnoor-promo-video/src/audio/voice-durations.json (generated)
  - C:/Users/scs/Desktop/alnoor-promo-video/src/audio/voices.ts, Voice.tsx, Sfx.tsx (new)
  - C:/Users/scs/Desktop/alnoor-promo-video/scripts/make-audio.mjs (new)
  - C:/Users/scs/Desktop/alnoor-promo-video/src/timeline.ts (now built from voice lengths)
  - C:/Users/scs/Desktop/alnoor-promo-video/src/Promo.tsx (Html5Audio, music ducking, whooshes, new scene)
  - C:/Users/scs/Desktop/alnoor-promo-video/src/scenes/*.tsx (voice and effect cues)
  - C:/Users/scs/Desktop/alnoor-promo-video/src/scenes/DoneForYou.tsx (new)
  - C:/Users/scs/Desktop/alnoor-promo-video/src/cta.ts (service wording)
  - C:/Users/scs/Desktop/alnoor-promo-video/public/voice/*.wav, public/sfx/*.wav (generated)
  - history/prompts/general/0066-promo-video-voice-sfx-music.general.prompt.md
tests:
  - npx tsc --noEmit (pass)
  - every voice clip and effect checked for audible level with ffmpeg volumedetect
  - stills of the retimed Hook, Conversation and new DoneForYou scene checked by eye
  - final MP4 checked with ffprobe and volumedetect
---

## Prompt

video ha no voice?
what to do
video has no voice

## Response snapshot

Explained that the video was silent by design: the original choice was captions only, plus a silent track. Then planned the audio in plan mode. The user chose:
- a narrator, voices in the call scene, sound effects and background music
- the free Microsoft neural voices (edge-tts)
- English narration
- the narrator should present the offer as a done-for-you service, not a product

Built it as follows:
- **Install and voices.** Installed edge-tts. All 17 spoken lines live in `src/audio/voice-lines.json`. Voices:
  - Andrew: the narrator
  - Asad and Uzma: Urdu parent and AI
  - Prabhat and Neerja: English parent and AI
- **Generation.** `scripts/make-audio.mjs` voices each line, trims silence, measures its length and writes `voice-durations.json`. It also synthesises 11 effects with ffmpeg (ring, fail, ping, glitch, shimmer, blip, pop, tick, click, chime, whoosh), with no downloads.
- **Timing.** `timeline.ts` now builds every scene's length from the real clip lengths, so speech is never cut off or overlapping. The Conversation bubbles appear as each voice speaks, and the Hook's "No answer" moment lands right after the first line.
- **Music.** Music is optional (`public/music.mp3`), fades in and out, and is ducked under speech.
- **New scene.** "Not software. A done-for-you service." with three steps, editable in `src/cta.ts`.
- **Fixes along the way.**
  - The whoosh was silent because the bandpass width was read as a Q value.
  - The glitch effect peaked at 0 dB.
  - The call timer would have shown "00:63".
  - Voices were sped up 5–10% to keep the video near 80 s.

## Outcome

- ✅ Impact: the video now has narration, real Urdu and English call voices, and sound effects. Music drops in automatically when the user adds a file.
- 🧪 Tests: type check passes; every audio file has audible levels; stills checked; the final MP4 was probed for an audio stream and its loudness.
- 📁 Files: the new audio pipeline and scene; a data-driven timeline; generated voice and effect files.
- 🔁 Next prompts: the user listens to the MP4, checks Urdu pronunciation and the service wording, adds their name in `src/cta.ts` and `music.mp3`, then runs `npm run render`.
- 🧠 Reflection: the claude cannot hear audio, so the user is the final check on pronunciation and volume balance; levels were verified numerically.

## Evaluation notes (flywheel)

- Failure modes observed: an ffmpeg filter parameter was misread (bandpass width type); comma escaping in lavfi expressions.
- Graders run and results (PASS/FAIL): tsc PASS; volumedetect PASS after the whoosh fix.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): use edge-tts word-boundary subtitles to time caption words exactly to the narration.

---
id: 0065
title: Fix promo video that will not play
stage: general
date: 2026-10-07
surface: agent
model: claude-opus-5-5
feature: none
branch: 011-tester-feedback
user: talhawork257
command: none
labels: ["marketing", "video", "remotion", "bugfix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - C:/Users/scs/Desktop/alnoor-promo-video/remotion.config.ts
  - C:/Users/scs/Desktop/alnoor-promo-video/out/alnoor-promo-4x5.mp4 (re-rendered)
  - history/prompts/general/0065-fix-promo-video-cant-play.general.prompt.md
tests:
  - ffprobe shows yuv420p, tv range, bt709, AAC audio track, moov before mdat
  - ffmpeg full decode of the MP4 with no errors
  - frame extracted from the MP4 checked by eye for correct colours
---

## Prompt

video is not running it show can't play

## Response snapshot

ffprobe showed the root cause. Remotion renders frames as JPEG, and that produced a full-range `yuvj420p` H.264 file tagged `color_range=pc`, with no audio track. Windows' built-in player, many phones and LinkedIn often refuse that format. The file itself decoded fine.

Fixed permanently in `remotion.config.ts` with three settings:
- `setPixelFormat("yuv420p")`
- `setColorSpace("bt709")`
- `setEnforceAudioTrack(true)`, which adds a silent AAC track

The video was then re-rendered. It now plays as standard H.264 High, yuv420p, limited range, bt709, with AAC audio and fast-start atom order. It is still 60 s at 1080x1350.

One render was wasted because the config edit failed: the file had not been read before it was written. The edit was redone and the video rendered again.

## Outcome

- ✅ Impact: the MP4 uses the most widely supported H.264 format for Windows, phones and LinkedIn.
- 🧪 Tests: ffprobe format check, full ffmpeg decode, frame colour check.
- 📁 Files: `remotion.config.ts`; re-rendered MP4; this PHR.
- 🔁 Next prompts: the user confirms it plays, adds their name in `src/cta.ts`, and re-renders.
- 🧠 Reflection: check pix_fmt with ffprobe before calling a render done; "1080x1350, 30 fps, H.264" was not enough to prove the file would play.

## Evaluation notes (flywheel)

- Failure modes observed: the first verification checked size, fps, codec and duration but not the pixel format or colour range.
- Graders run and results (PASS/FAIL): ffprobe format PASS; decode PASS.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): add a pix_fmt assertion to the render verification step.

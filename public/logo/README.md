# Logo reveal video

After the countdown hits 0, your logo-reveal video plays once, then the poster
pieces fly in and the fire blast fires.

Drop your file(s) here (`public/logo/`):

| File          | Notes                                             |
|---------------|---------------------------------------------------|
| `reveal.webm` | Preferred — supports **transparency** (alpha)     |
| `reveal.mp4`  | Fallback for browsers without WebM (plays on black)|

You can provide just one; the player tries `reveal.webm` first, then
`reveal.mp4`.

## Notes
- The video is **muted** so it autoplays reliably on every browser (incl. iOS)
  and doesn't clash with the background music. If your logo reveal has its own
  sound you want to hear, tell me and I can unmute it (autoplay-with-sound can
  be blocked on some browsers, so we'd handle that).
- It plays **once** and then advances automatically on the video's `ended`
  event. If the file is missing or playback is blocked, the experience skips
  straight to the poster assembly (never gets stuck).
- Keep it short (a few seconds). A 20s safety cap will advance the flow if the
  `ended` event never fires.
- For a transparent logo over the scene, export **WebM with alpha** (VP9 +
  alpha). An MP4 will play on a solid black background instead.
- Supported by the browser: `.webm`, `.mp4`. For other formats, update
  `LOGO_SOURCES` in `src/components/LogoReveal.jsx`.

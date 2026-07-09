# Music / Sound files

Drop your audio files in **this folder** (`public/music/`) using these exact
names. Each maps to one moment of the experience. Any file you leave out just
stays silent — the app keeps working.

| File name       | When it plays                                   | Loops? |
|-----------------|-------------------------------------------------|--------|
| `opening.mp3`   | The "Tap Anywhere to Begin" screen (ambient)    | yes    |
| `listening.mp3` | While the voice orb is listening for the phrase | yes    |
| `impact.mp3`    | The hit the moment the phrase is recognised     | no     |
| `reveal.mp3`    | The climactic title / poster reveal music       | yes    |

## How to replace a sound
1. Put your file in this folder with the matching name above (e.g. drag your
   track in and rename it to `reveal.mp3`).
2. Refresh the browser. That's it.

## Notes
- Supported formats: **mp3, ogg, wav, m4a, webm**. If you use a different
  extension, update the `src` paths in `src/hooks/useAudioController.js`.
- Volume per track is set in the `TRACKS` config in that same file — tweak the
  `volume` values (0.0–1.0) to taste.
- The mute button (top-right speaker icon) mutes everything at once.
- These files live under `public/`, so Vite serves them directly at
  `/music/<name>` — no import needed.

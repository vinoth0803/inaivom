# Music / Sound files

Drop these two files in **this folder** (`public/music/`). Either one that's
missing just stays silent — the experience still works.

| File name    | What it is                                         | Loops? |
|--------------|----------------------------------------------------|--------|
| `music.mp3`  | Background music. Starts when the countdown begins  | yes    |
| `impact.mp3` | One-shot hit the instant the phrase is recognised   | no     |

## Notes
- Music intentionally stays **silent while the mic is listening** so it doesn't
  interfere with speech recognition — it kicks in with the impact at "5".
- Volumes are set in the `Howl` configs in `src/hooks/useAudioController.js`
  (`music` volume 0.6, `impact` 0.9) — tweak to taste.
- Supported formats: mp3, ogg, wav, m4a, webm. For a different extension,
  update `MUSIC_SRC` / `IMPACT_SRC` in that file.
- The mute button (top-right speaker) mutes everything.
- After adding files, just refresh the browser.

# Poster files

The launch flies four pieces in from the corners, joins them, then fades the
full poster in over the top (hiding any seams) with a confetti blast.

## Files to add here (`public/poster/`)

Design your poster at a **4:5 portrait ratio** (e.g. 1200 × 1500 px), then:

**1. Cut it into four EQUAL quarters:**

| File     | Which quarter |
|----------|---------------|
| `1.png`  | Top-left      |
| `2.png`  | Top-right     |
| `3.png`  | Bottom-left   |
| `4.png`  | Bottom-right  |

**2. Also save the whole, uncut poster as:**

| File       | What it is                                     |
|------------|------------------------------------------------|
| `full.png` | The complete poster — fades in over the pieces |

That's it — refresh the browser. No code changes needed.

## Notes
- Each quarter is also 4:5, so they line up exactly.
- If a slice is missing it falls back to a dark gradient; if `full.png` is
  missing, the joined pieces just stay on screen (no crash).
- `.png`, `.jpg`, `.webp` all work. For other extensions, update the `SLICES`
  paths in `src/components/PosterAssembly.jsx` and `FULL_POSTER` in
  `src/components/PosterReveal.jsx`.
- Put all text / logos (Rotary emblem, title, date, venue) **inside the poster
  artwork** — the old on-screen "R" emblem, "INAIVOM" title, and detail cards
  have been removed.

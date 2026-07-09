# INAIVOM - Voice-Activated Cinematic Launch Experience

A premium, immersive, movie-quality microsite that launches the INAIVOM event through voice recognition. Built with React, GSAP, and the Web Speech API.

## Features

🎬 **Cinematic Experience**
- Hollywood-style title reveal animation
- Multi-layered particle systems
- Volumetric fog and lighting effects
- 60fps smooth animations

🎤 **Voice Activation**
- Web Speech API integration
- Real-time audio visualization
- Fallback button for unsupported browsers
- Responsive to "Inaivom Ondraga" command

🎨 **Premium Visual Design**
- Royal Purple (#800080) and Metallic Gold (#D4AF37) color palette
- 3D metallic text effects
- Animated rotary wheel
- Film grain and vignette overlays

🔊 **Layered Audio**
- Synthesized ambient sounds
- Bass impact on activation
- Orchestral reveal music
- Mute/unmute controls

## User Journey

1. **Opening** - Dark screen with dim title and tap prompt
2. **Listening** - Voice orb pulses with microphone input
3. **Activation** - Bass impact, screen shake, particle explosion
4. **Title Reveal** - Cinematic text animation
5. **Poster Assembly** - Dynamic panel construction
6. **Event Info** - Sequential content reveal
7. **Final Scene** - Complete hero view with ambient motion

## Technology Stack

- **React 18** - UI framework
- **Vite 5** - Build tool
- **Tailwind CSS** - Styling
- **GSAP** - Animation library
- **Web Speech API** - Voice recognition
- **Web Audio API** - Audio synthesis

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production files will be in the `dist/` directory.

## Browser Support

- **Chrome/Edge** - Full support (voice recognition + audio)
- **Firefox** - Audio only (voice recognition via fallback)
- **Safari** - Audio only (voice recognition via fallback)
- **Mobile browsers** - Touch-optimized with reduced particle count

## Voice Command

To unlock the experience, say:
> **"Inaivom Ondraga"**

If voice recognition is unavailable, a "Launch Experience" button will appear.

## Performance Optimizations

- GPU-accelerated animations
- Frame skipping on mobile devices
- Efficient particle rendering
- Lazy-loaded assets
- Reduced motion support

## Credits

- Fonts: Cinzel (Google Fonts), Inter (Google Fonts)
- Icons: Lucide React
- Animation: GSAP

## License

MIT License - Created for the INAIVOM project launch.

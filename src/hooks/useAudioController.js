import { useState, useRef, useCallback, useEffect } from 'react';
import { Howl, Howler } from 'howler';

/**
 * Scene -> audio file mapping.
 *
 * Drop your own files into `public/music/` using these exact names
 * (see public/music/README.md). Any file that is missing simply stays
 * silent — the experience keeps working without it.
 *
 *   opening.mp3    ambient bed, plays on the "Tap to Begin" screen (loops)
 *   listening.mp3  plays while the voice orb is listening (loops)
 *   impact.mp3     the hit when the phrase is recognised (one-shot)
 *   reveal.mp3     the climactic title / poster reveal music (loops)
 *
 * Supported formats: mp3, ogg, wav, m4a, webm. Change the extension below
 * if you use something other than .mp3.
 */
const TRACKS = {
  opening:    { src: '/music/opening.mp3',   loop: true,  volume: 0.5, fadeMs: 1500 },
  listening:  { src: '/music/listening.mp3', loop: true,  volume: 0.5, fadeMs: 1000 },
  activation: { src: '/music/impact.mp3',    loop: false, volume: 0.9, fadeMs: 0 },
  reveal:     { src: '/music/reveal.mp3',    loop: true,  volume: 0.7, fadeMs: 1500 },
};

const useAudioController = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [currentScene, setCurrentScene] = useState('opening');
  const [isLoaded, setIsLoaded] = useState(false);

  // One Howl instance per scene, keyed by scene name.
  const howlsRef = useRef({});

  const loadAudio = useCallback(async () => {
    // Build a Howl for each configured track. A missing file just logs a
    // warning and is skipped — it never blocks the experience.
    Object.entries(TRACKS).forEach(([scene, cfg]) => {
      if (howlsRef.current[scene]) return; // already created

      const howl = new Howl({
        src: [cfg.src],
        loop: cfg.loop,
        volume: cfg.volume,
        html5: false,
        onloaderror: () => {
          console.warn(
            `[audio] No file at ${cfg.src} — "${scene}" will be silent. ` +
            `Add it to public/music/ to enable this sound.`
          );
        },
      });

      howlsRef.current[scene] = { howl, cfg };
    });

    Howler.mute(isMuted);
    setIsLoaded(true);
  }, [isMuted]);

  // Play the track for `scene`, fading out every other scene's track.
  const transitionToScene = useCallback((scene) => {
    const entries = Object.entries(howlsRef.current);

    entries.forEach(([key, { howl, cfg }]) => {
      if (key === scene) {
        if (!howl.playing()) {
          if (cfg.fadeMs > 0) {
            howl.volume(0);
            const id = howl.play();
            howl.fade(0, cfg.volume, cfg.fadeMs, id);
          } else {
            howl.volume(cfg.volume);
            howl.play();
          }
        }
      } else if (howl.playing()) {
        // Fade out and stop anything from the previous scene.
        if (cfg.fadeMs > 0) {
          howl.fade(howl.volume(), 0, cfg.fadeMs);
          howl.once('fade', () => howl.stop());
        } else {
          howl.stop();
        }
      }
    });

    setCurrentScene(scene);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      Howler.mute(next);
      return next;
    });
  }, []);

  // Kept for API compatibility with App.jsx — replays the impact one-shot.
  const playBassImpact = useCallback(() => {
    const entry = howlsRef.current.activation;
    if (entry) {
      entry.howl.volume(entry.cfg.volume);
      entry.howl.play();
    }
  }, []);

  // Cleanup on unmount.
  useEffect(() => {
    const howls = howlsRef.current;
    return () => {
      Object.values(howls).forEach(({ howl }) => howl.unload());
    };
  }, []);

  return {
    isMuted,
    isLoaded,
    currentScene,
    loadAudio,
    toggleMute,
    transitionToScene,
    playBassImpact,
  };
};

export default useAudioController;

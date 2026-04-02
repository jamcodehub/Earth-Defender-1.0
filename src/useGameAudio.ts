import { useRef, useEffect, useCallback } from 'react';

interface AudioFiles {
  bgMusic:   string;
  approve:   string;
  deny:      string;
  correct:   string;
  wrong:     string;
  dayChange: string;
  gameOver:  string;
  menuMusic: string;
}

const AUDIO_FILES: AudioFiles = {
  bgMusic:   '/sounds/background-music.mp3',
  approve:   '/sounds/approve.mp3',
  deny:      '/sounds/deny.mp3',
  correct:   '/sounds/correct.mp3',
  wrong:     '/sounds/wrong.mp3',
  dayChange: '/sounds/day-change.mp3',
  gameOver:  '/sounds/game-over.mp3',
  menuMusic: '/sounds/menu-music.mp3',
};

export function useGameAudio() {
  const refs      = useRef<Record<string, HTMLAudioElement>>({});
  const musicVol  = useRef(0.3);
  const sfxVol    = useRef(0.5);
  const mutedRef  = useRef(false);

  // Initialise once — stable across all renders
  useEffect(() => {
    Object.entries(AUDIO_FILES).forEach(([key, src]) => {
      try {
        const audio     = new Audio(src);
        audio.preload   = 'auto';
        const isMusic   = key.includes('Music');
        audio.volume    = isMusic ? musicVol.current : sfxVol.current;
        if (isMusic) audio.loop = true;
        audio.addEventListener('error', () =>
          console.warn(`Audio not found: ${src}`)
        );
        refs.current[key] = audio;
      } catch {
        /* silent fail */
      }
    });
    return () => {
      Object.values(refs.current).forEach(a => { a.pause(); a.src = ''; });
    };
  }, []);

  // ── Stable callbacks — never recreated ──────────────────────────────────

  const playSound = useCallback((name: keyof AudioFiles) => {
    if (mutedRef.current) return;
    const a = refs.current[name];
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => { /* browser blocked */ });
  }, []);

  const playMusic = useCallback((name: 'bgMusic' | 'menuMusic') => {
    if (mutedRef.current) return;
    // Stop all music tracks first
    Object.entries(refs.current).forEach(([k, a]) => {
      if (k.includes('Music') && k !== name) { a.pause(); a.currentTime = 0; }
    });
    refs.current[name]?.play().catch(() => { /* browser blocked */ });
  }, []);

  const stopMusic = useCallback(() => {
    Object.entries(refs.current).forEach(([k, a]) => {
      if (k.includes('Music')) { a.pause(); a.currentTime = 0; }
    });
  }, []);

  const toggleMute = useCallback((): boolean => {
    mutedRef.current = !mutedRef.current;
    Object.values(refs.current).forEach(a => { a.muted = mutedRef.current; });
    return mutedRef.current;
  }, []);

  const setMusicVolume = useCallback((v: number) => {
    musicVol.current = Math.max(0, Math.min(1, v));
    Object.entries(refs.current).forEach(([k, a]) => {
      if (k.includes('Music')) a.volume = musicVol.current;
    });
  }, []);

  const setSfxVolume = useCallback((v: number) => {
    sfxVol.current = Math.max(0, Math.min(1, v));
    Object.entries(refs.current).forEach(([k, a]) => {
      if (!k.includes('Music')) a.volume = sfxVol.current;
    });
  }, []);

  const isMuted = useCallback(() => mutedRef.current, []);

  return { playSound, playMusic, stopMusic, toggleMute, setMusicVolume, setSfxVolume, isMuted };
}

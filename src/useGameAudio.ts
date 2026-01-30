import { useRef, useEffect } from 'react';

interface AudioFiles {
  bgMusic: string;
  approve: string;
  deny: string;
  correct: string;
  wrong: string;
  dayChange: string;
  gameOver: string;
  menuMusic: string;
}

export const useGameAudio = () => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const musicVolume = useRef(0.3);
  const sfxVolume = useRef(0.5);
  const isMuted = useRef(false);

  useEffect(() => {
    // Initialize audio elements
    const audioFiles: AudioFiles = {
      bgMusic: '/sounds/background-music.mp3',
      approve: '/sounds/approve.mp3',
      deny: '/sounds/deny.mp3',
      correct: '/sounds/correct.mp3',
      wrong: '/sounds/wrong.mp3',
      dayChange: '/sounds/day-change.mp3',
      gameOver: '/sounds/game-over.mp3',
      menuMusic: '/sounds/menu-music.mp3',
    };

    Object.entries(audioFiles).forEach(([key, src]) => {
      try {
        const audio = new Audio(src);
        audio.preload = 'auto';
        
        // Set volume based on type
        if (key.includes('Music')) {
          audio.volume = musicVolume.current;
          audio.loop = true;
        } else {
          audio.volume = sfxVolume.current;
        }
        
        // Handle errors silently
        audio.addEventListener('error', () => {
          console.warn(`Audio file not found: ${src}`);
        });
        
        audioRefs.current[key] = audio;
      } catch (err) {
        console.warn(`Failed to load audio: ${src}`, err);
      }
    });

    return () => {
      // Cleanup: stop and remove all audio
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  const playSound = (soundName: keyof AudioFiles) => {
    if (isMuted.current) return;
    
    const audio = audioRefs.current[soundName];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => {
        console.warn(`Failed to play sound: ${soundName}`, err);
      });
    }
  };

  const playMusic = (musicName: 'bgMusic' | 'menuMusic') => {
    if (isMuted.current) return;
    
    // Stop all other music first
    Object.entries(audioRefs.current).forEach(([key, audio]) => {
      if (key.includes('Music') && key !== musicName) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    const music = audioRefs.current[musicName];
    if (music) {
      music.play().catch(err => {
        console.warn(`Failed to play music: ${musicName}`, err);
      });
    }
  };

  const stopMusic = () => {
    Object.entries(audioRefs.current).forEach(([key, audio]) => {
      if (key.includes('Music')) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  };

  const toggleMute = () => {
    isMuted.current = !isMuted.current;
    Object.values(audioRefs.current).forEach(audio => {
      audio.muted = isMuted.current;
    });
    return isMuted.current;
  };

  const setMusicVolume = (volume: number) => {
    musicVolume.current = Math.max(0, Math.min(1, volume));
    Object.entries(audioRefs.current).forEach(([key, audio]) => {
      if (key.includes('Music')) {
        audio.volume = musicVolume.current;
      }
    });
  };

  const setSfxVolume = (volume: number) => {
    sfxVolume.current = Math.max(0, Math.min(1, volume));
    Object.entries(audioRefs.current).forEach(([key, audio]) => {
      if (!key.includes('Music')) {
        audio.volume = sfxVolume.current;
      }
    });
  };

  return {
    playSound,
    playMusic,
    stopMusic,
    toggleMute,
    setMusicVolume,
    setSfxVolume,
    isMuted: () => isMuted.current,
  };
};

import { useRef, useEffect, useCallback } from 'react';
import type { VoiceType } from './characters';

// ── Voice configuration per species type ────────────────────────────────────
interface VoiceConfig {
  notes: string[];
  duration: string;
  intervalMs: number;
  oscillatorType: string;
  filterFreq: number;
  filterType: string;
  filterQ: number;
  volume: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

const VOICE_CONFIGS: Record<VoiceType, VoiceConfig> = {
  // Warm, mid-range human speech — triangle wave, natural cadence
  human: {
    notes: ['d3', 'e3', 'f3', 'g3', 'a3', 'c4', 'b3'],
    duration: '16n',
    intervalMs: 130,
    oscillatorType: 'triangle',
    filterFreq: 1100,
    filterType: 'lowpass',
    filterQ: 0.8,
    volume: -9,
    attack: 0.001,
    decay: 0.07,
    sustain: 0.04,
    release: 0.08,
  },

  // Ethereal, high-pitched alien speech — square wave, faster, airy
  alien: {
    notes: ['g4', 'a4', 'b4', 'c5', 'd5', 'e5', 'f4'],
    duration: '32n',
    intervalMs: 85,
    oscillatorType: 'square',
    filterFreq: 2200,
    filterType: 'bandpass',
    filterQ: 1.5,
    volume: -11,
    attack: 0.001,
    decay: 0.04,
    sustain: 0.02,
    release: 0.06,
  },

  // Deep, distorted Zorgon speech — heavy square wave, slow, menacing
  zorgon: {
    notes: ['c1', 'd1', 'g1', 'a1', 'b1', 'c2', 'e1'],
    duration: '8n',
    intervalMs: 210,
    oscillatorType: 'square',
    filterFreq: 320,
    filterType: 'lowpass',
    filterQ: 2.0,
    volume: -3,
    attack: 0.003,
    decay: 0.18,
    sustain: 0.12,
    release: 0.25,
  },
};

// ── Hook ────────────────────────────────────────────────────────────────────
export function useVoice(globalMuted: boolean) {
  const synthRef    = useRef<any>(null);
  const filterRef   = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeVoice = useRef<VoiceType>('human');
  const mutedRef    = useRef(globalMuted);

  useEffect(() => { mutedRef.current = globalMuted; }, [globalMuted]);

  // ── Dispose helpers ──────────────────────────────────────────────────────
  const disposeAll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    try { synthRef.current?.triggerRelease(); }  catch { /* no notes active */ }
    try { synthRef.current?.dispose(); }         catch { /* already disposed */ }
    try { filterRef.current?.dispose(); }        catch { /* already disposed */ }
    synthRef.current  = null;
    filterRef.current = null;
  }, []);

  // ── Build a new synth+filter pair for the given voice type ───────────────
  const buildVoice = useCallback((voiceType: VoiceType) => {
    if (typeof window.Tone === 'undefined') return;

    disposeAll();

    const cfg = VOICE_CONFIGS[voiceType];
    activeVoice.current = voiceType;

    filterRef.current = new window.Tone.Filter({
      frequency: cfg.filterFreq,
      type:      cfg.filterType,
      Q:         cfg.filterQ,
    });

    synthRef.current = new window.Tone.PolySynth(window.Tone.Synth, {
      oscillator: { type: cfg.oscillatorType },
      envelope: {
        attack:  cfg.attack,
        decay:   cfg.decay,
        sustain: cfg.sustain,
        release: cfg.release,
      },
    }).connect(filterRef.current);

    filterRef.current.toDestination();
    synthRef.current.volume.value = cfg.volume;
  }, [disposeAll]);

  // ── Play a single random note ────────────────────────────────────────────
  const playNote = useCallback(() => {
    if (mutedRef.current || !synthRef.current) return;
    try {
      const cfg  = VOICE_CONFIGS[activeVoice.current];
      const note = cfg.notes[Math.floor(Math.random() * cfg.notes.length)];
      synthRef.current.triggerAttackRelease(note, cfg.duration);
    } catch { /* silent fail */ }
  }, []);

  // ── Public API ───────────────────────────────────────────────────────────
  const startSpeaking = useCallback((voiceType: VoiceType) => {
    if (typeof window.Tone === 'undefined') return;

    buildVoice(voiceType);

    // Play the first note immediately, then tick on the interval
    playNote();
    const cfg = VOICE_CONFIGS[voiceType];
    intervalRef.current = setInterval(playNote, cfg.intervalMs);
  }, [buildVoice, playNote]);

  const stopSpeaking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    try { synthRef.current?.triggerRelease(); } catch { /* no notes active */ }
  }, []);

  // Cleanup on unmount
  useEffect(() => () => disposeAll(), [disposeAll]);

  return { startSpeaking, stopSpeaking };
}

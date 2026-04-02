import { useState, useEffect } from 'react';
import type { CharacterData, VoiceType } from './characters';

// ── Palette per claimed species ──────────────────────────────────────────────
const SPECIES_PALETTE: Record<string, { border: string; label: string; badge: string }> = {
  Human:      { border: '#3b82f6', label: '#93c5fd', badge: '#1e3a8a' },
  Andromedan: { border: '#a855f7', label: '#d8b4fe', badge: '#581c87' },
  Pleiadian:  { border: '#06b6d4', label: '#67e8f9', badge: '#164e63' },
  Zorgon:     { border: '#ef4444', label: '#fca5a5', badge: '#7f1d1d' },
};

const VOICE_LABEL: Record<VoiceType, string> = {
  human:  'HUMAN SPEECH PATTERN',
  alien:  'ALLIED ALIEN PATTERN',
  zorgon: 'ZORGON PATTERN DETECTED',
};

const VOICE_COLOR: Record<VoiceType, string> = {
  human:  '#4ade80',
  alien:  '#22d3ee',
  zorgon: '#ef4444',
};

interface CharacterPortraitProps {
  character:      CharacterData;
  characterName:  string;
  claimedSpecies: string;
  /** Voice of the character as emitted — may differ from claimed species. */
  actualVoice:    VoiceType;
  isSpeaking:     boolean;
  dialogueLine:   string;
  showVoiceID:    boolean; // Day 8+ voiceID check active
}

// ── Emoji fallback when images aren't present yet ───────────────────────────
function SpeciesEmoji({ species }: { species: string }) {
  const map: Record<string, string> = {
    Human: '👤', Andromedan: '🛸', Pleiadian: '🌌', Zorgon: '👾',
  };
  return <span style={{ fontSize: 56 }}>{map[species] ?? '👤'}</span>;
}

// ── Main component ───────────────────────────────────────────────────────────
export default function CharacterPortrait({
  character,
  characterName,
  claimedSpecies,
  actualVoice,
  isSpeaking,
  dialogueLine,
  showVoiceID,
}: CharacterPortraitProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [charIdx,        setCharIdx]       = useState(0);
  const [mouthOpen,      setMouthOpen]     = useState(false);
  const [imgOpen,        setImgOpen]       = useState(true);
  const [imgClosed,      setImgClosed]     = useState(true);

  const palette     = SPECIES_PALETTE[claimedSpecies] ?? SPECIES_PALETTE.Human;
  const isImposter  = character.isImposter === true;
  // voiceID mismatch: character claims to be non-Zorgon but voice is Zorgon
  const voiceMismatch = showVoiceID && actualVoice === 'zorgon' && claimedSpecies !== 'Zorgon';

  // Reset typewriter when dialogue changes
  useEffect(() => {
    setDisplayedText('');
    setCharIdx(0);
  }, [dialogueLine]);

  // Typewriter tick
  useEffect(() => {
    if (charIdx >= dialogueLine.length) return;
    const t = setTimeout(() => {
      setDisplayedText(p => p + dialogueLine[charIdx]);
      setCharIdx(p => p + 1);
    }, 55);
    return () => clearTimeout(t);
  }, [charIdx, dialogueLine]);

  // Mouth animation
  useEffect(() => {
    if (!isSpeaking) { setMouthOpen(false); return; }
    const id = setInterval(() => setMouthOpen(p => !p), 150);
    return () => clearInterval(id);
  }, [isSpeaking]);

  // Portrait image paths — drop PNGs in /public/characters/{id}/
  const openSrc   = `/characters/${character.id}/open.png`;
  const closedSrc = `/characters/${character.id}/closed.png`;
  const showOpen  = imgOpen  && mouthOpen && isSpeaking;
  const showClosed = imgClosed && !(mouthOpen && isSpeaking);

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
        border: `2px solid ${palette.border}`,
        boxShadow: `0 0 20px ${palette.border}40`,
        minWidth: 220,
        maxWidth: 260,
      }}
    >
      {/* ── Header ── */}
      <div
        className="text-center font-mono py-1 px-2"
        style={{ background: palette.badge, fontSize: 9, letterSpacing: '0.12em', color: palette.label }}
      >
        ⟪ EARTH DEFENSE NET — IDENTITY CHECK ⟫
      </div>

      {/* ── Portrait ── */}
      <div className="relative mx-auto mt-3" style={{ width: 120, height: 150 }}>
        {/* Closed-mouth image */}
        <img
          src={closedSrc}
          alt={characterName}
          className="absolute inset-0 w-full h-full object-cover rounded"
          style={{ display: showClosed ? 'block' : 'none', imageRendering: 'pixelated' }}
          onError={() => setImgClosed(false)}
        />
        {/* Open-mouth image */}
        <img
          src={openSrc}
          alt={characterName}
          className="absolute inset-0 w-full h-full object-cover rounded"
          style={{ display: showOpen ? 'block' : 'none', imageRendering: 'pixelated' }}
          onError={() => setImgOpen(false)}
        />
        {/* Emoji fallback (shows if both images fail) */}
        {!imgOpen && !imgClosed && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded"
            style={{ background: '#0f172a', border: '1px solid #334155' }}
          >
            <SpeciesEmoji species={claimedSpecies} />
          </div>
        )}
        {/* Scan-line overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded"
          style={{
            background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)',
          }}
        />
        {/* Speaking glow */}
        {isSpeaking && (
          <div
            className="absolute inset-0 rounded"
            style={{ boxShadow: `inset 0 0 12px ${palette.border}60` }}
          />
        )}
      </div>

      {/* ── ID fields ── */}
      <div className="font-mono px-3 py-2 space-y-0.5" style={{ fontSize: 10 }}>
        <IdRow label="NAME"    value={characterName}  color={palette.label} />
        <IdRow label="SPECIES" value={claimedSpecies}  color={palette.label} />
        <IdRow label="ID №"    value={`EDN-${character.id.toUpperCase().slice(0, 7)}`} color="#94a3b8" />
      </div>

      {/* ── Voice ID check (Day 8+) ── */}
      {showVoiceID && (
        <div
          className="mx-3 mb-2 rounded px-2 py-1 font-mono"
          style={{
            fontSize: 9,
            background: voiceMismatch ? '#7f1d1d40' : '#14532d40',
            border: `1px solid ${voiceMismatch ? '#ef4444' : '#4ade80'}`,
          }}
        >
          <div style={{ color: '#94a3b8', letterSpacing: '0.1em' }}>VOICE ID CHECK</div>
          <div style={{ color: VOICE_COLOR[actualVoice], fontWeight: 700 }}>
            {voiceMismatch ? '⚠ MISMATCH — ' : '✓ '}
            {VOICE_LABEL[actualVoice]}
          </div>
        </div>
      )}

      {/* ── Dialogue box ── */}
      <div
        className="mx-3 mb-3 rounded p-2"
        style={{ background: '#000000aa', border: '1px solid #334155', minHeight: 56 }}
      >
        <p
          className="font-mono leading-relaxed"
          style={{ color: voiceMismatch ? '#fca5a5' : '#86efac', fontSize: 10 }}
        >
          {displayedText}
          {charIdx < dialogueLine.length && (
            <span className="animate-pulse">▌</span>
          )}
        </p>
      </div>
    </div>
  );
}

function IdRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex gap-1">
      <span style={{ color: '#64748b', minWidth: 56 }}>{label}:</span>
      <span style={{ color }}>{value}</span>
    </div>
  );
}

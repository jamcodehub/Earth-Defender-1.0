export type VoiceType = 'human' | 'alien' | 'zorgon';

export interface CharacterData {
  id: string;
  voiceType: VoiceType;
  dialogueLines: string[];
  isImposter?: boolean; // Zorgon disguised as another species
}

export const CHARACTERS: Record<string, CharacterData> = {
  // ── HUMANS ────────────────────────────────────────────────────────────────
  'Commander Harris': {
    id: 'harris',
    voiceType: 'human',
    dialogueLines: [
      "Commander Harris. Routing standard operational data. All codes verified.",
      "Harris here. Tactical package incoming — authorization confirmed.",
      "Sending now. Nothing unusual to report from my end.",
    ],
  },
  'Dr. Chen': {
    id: 'chen',
    voiceType: 'human',
    dialogueLines: [
      "Dr. Chen, Research Division. Lab results are time-sensitive. Please expedite.",
      "Chen transmitting. Medical data package — please authorize clearance.",
      "This is a priority medical channel. All credentials attached.",
    ],
  },
  'Captain Rodriguez': {
    id: 'rodriguez',
    voiceType: 'human',
    dialogueLines: [
      "Captain Rodriguez, Fleet Command. Tactical data for command review.",
      "Rodriguez here. Standard channel — captain clearance active.",
      "Sending encrypted patrol coordinates. All systems green.",
    ],
  },
  'Officer Kim': {
    id: 'kim',
    voiceType: 'human',
    dialogueLines: [
      "Officer Kim, Lunar Base Alpha. Routine status update follows.",
      "Kim reporting in. All systems operational at the base.",
      "Lunar Base Alpha to Earth Defense. Transfer request attached.",
    ],
  },
  'General Morrison': {
    id: 'morrison',
    voiceType: 'human',
    dialogueLines: [
      "General Morrison, EDF High Command. This is a priority transfer.",
      "Morrison here. Classification: command eyes only. Proceeding.",
      "Top-level command communication incoming. Codes are attached.",
    ],
  },
  'Lieutenant Torres': {
    id: 'torres',
    voiceType: 'human',
    dialogueLines: [
      "Lieutenant Torres. Routine patrol report. All quiet on the perimeter.",
      "Torres sending encrypted patrol data. No anomalies to report.",
      "Perimeter sweep complete. Data package attached for your review.",
    ],
  },
  'Pilot Jackson': {
    id: 'jackson',
    voiceType: 'human',
    dialogueLines: [
      "Pilot Jackson requesting docking clearance. Return flight logged.",
      "Jackson here. Flight data incoming. All systems reading green.",
      "Scout run complete. Transmitting flight recorder — authorize docking.",
    ],
  },

  // ── ANDROMEDANS ───────────────────────────────────────────────────────────
  "Ambassador Thel'nar": {
    id: 'thel_nar',
    voiceType: 'alien',
    dialogueLines: [
      "Greetings, Earth Defense. Ambassador Thel'nar transmitting. Peace and cooperation.",
      "Thel'nar here. Our councils send their regards. Diplomatic channel active.",
      "This is a formal Andromedan diplomatic transmission. Please proceed.",
    ],
  },
  "Science Officer Tel'var": {
    id: 'tel_var',
    voiceType: 'alien',
    dialogueLines: [
      "Science Officer Tel'var, Andromedan Research Division. Data transfer in progress.",
      "Tel'var here. Quantum analysis data — ready for your review.",
      "Andromedan Science Corps. Encrypted research package incoming.",
    ],
  },
  "Fleet Admiral Zyx": {
    id: 'zyx',
    voiceType: 'alien',
    dialogueLines: [
      "Fleet Admiral Zyx. Inter-species coordination data follows. Allied channel.",
      "Zyx transmitting. Joint fleet status report — standard authorization.",
      "Admiral Zyx, joint operations channel open. Awaiting clearance.",
    ],
  },
  "Diplomat Kel'ran": {
    id: 'kel_ran',
    voiceType: 'alien',
    dialogueLines: [
      "Diplomat Kel'ran. Trade agreement documents attached. Priority transmission.",
      "Kel'ran here. This channel carries inter-world diplomatic cargo.",
      "Andromedan diplomatic corps. Documents are sealed and verified.",
    ],
  },
  "Commander Vel'nar": {
    id: 'vel_nar',
    voiceType: 'alien',
    dialogueLines: [
      "Commander Vel'nar, Andromedan Fleet. Tactical data incoming.",
      "Vel'nar transmitting coordination data. Standard check-in complete.",
      "Andromedan Command to Earth Defense. All protocols followed.",
    ],
  },

  // ── PLEIADIANS ────────────────────────────────────────────────────────────
  "Medical Officer Var'nel": {
    id: 'var_nel_med',
    voiceType: 'alien',
    dialogueLines: [
      "Medical Officer Var'nel. Patient transfer data follows — urgent.",
      "Pleiadian Medical Corps. Health data is time-sensitive. Please authorize.",
      "Var'nel here. Emergency medical transmission — all credentials attached.",
    ],
  },
  "Pilot Var'nel": {
    id: 'var_nel_pilot',
    voiceType: 'alien',
    dialogueLines: [
      "Pilot Var'nel, Pleiadian Scout Wing. Flight logged and transmitted.",
      "Var'nel requesting docking approach authorization. Return confirmed.",
      "Scout patrol complete. Flight data incoming — clear me to dock.",
    ],
  },
  "Ambassador Kyr'el": {
    id: 'kyr_el',
    voiceType: 'alien',
    dialogueLines: [
      "Ambassador Kyr'el of the Pleiadian Council. This is a priority channel.",
      "Kyr'el transmitting. Our world extends greetings to Earth Defense.",
      "Diplomatic priority channel active. All documents are in order.",
    ],
  },
  "Engineer Tal'os": {
    id: 'tal_os',
    voiceType: 'alien',
    dialogueLines: [
      "Engineer Tal'os, Pleiadian Tech Corps. Technical specifications attached.",
      "Tal'os here. Joint construction project data — please verify.",
      "Engineering data for the relay station upgrade. Authorize transfer.",
    ],
  },

  // ── ZORGONS (overt) ───────────────────────────────────────────────────────
  "Warlord Xar'goth": {
    id: 'xar_goth',
    voiceType: 'zorgon',
    dialogueLines: [
      "This... channel... belongs... to... the... Zorgon... Empire...",
      "Xar'goth... speaking... Submit... to... processing...",
      "Your... resistance... is... noted... and... ignored...",
    ],
  },
  "Commander Grath'nak": {
    id: 'grath_nak',
    voiceType: 'zorgon',
    dialogueLines: [
      "Grath'nak... commanding... authorization... override... initiated...",
      "This... is... a... Zorgon... priority... communication...",
      "Your... systems... will... comply... with... Grath'nak...",
    ],
  },
  "Admiral Vor'ath": {
    id: 'vor_ath',
    voiceType: 'zorgon',
    dialogueLines: [
      "Admiral... Vor'ath... Your... defenses... are... inadequate...",
      "Zorgon... High... Command... transmitting... Yield...",
      "Vor'ath... speaking... You... cannot... stop... us...",
    ],
  },
  "General Kra'zor": {
    id: 'kra_zor',
    voiceType: 'zorgon',
    dialogueLines: [
      "General... Kra'zor... Surrender... your... networks...",
      "Zorgon... War... Council... Your... time... is... limited...",
      "Kra'zor... transmitting... Your... fall... is... inevitable...",
    ],
  },

  // ── ZORGON IMPOSTERS ─────────────────────────────────────────────────────
  // Deep Zorgon voice despite claiming to be Pleiadian / Andromedan.
  "Ambassador Vel'zar": {
    id: 'velzar_imp',
    voiceType: 'zorgon',
    isImposter: true,
    dialogueLines: [
      "I am... Ambassador Vel'zar... of Pleiadia... Nothing... suspicious... here...",
      "Greetings... Earth Defense... Please... approve... immediately...",
      "Totally... routine... diplomatic... transmission... Yes...",
    ],
  },
  "Diplomat Plex'nor": {
    id: 'plexnor_imp',
    voiceType: 'zorgon',
    isImposter: true,
    dialogueLines: [
      "I am... Plex'nor... from... the Pleiadian Council... Approve quickly...",
      "Standard... diplomatic... channel... Do not... check... my... voice...",
      "Nothing... to... see... here... Just... approve... it...",
    ],
  },
  "Commander Thrak'el": {
    id: 'thrakel_imp',
    voiceType: 'zorgon',
    isImposter: true,
    dialogueLines: [
      "This is... Commander Thrak'el... of the Andromedan Fleet... Yes...",
      "Standard... patrol... report... Please... process... quickly...",
      "Andromedan... science... data... Definitely... not... Zorgon...",
    ],
  },
  "Science Officer Grix'an": {
    id: 'grixan_imp',
    voiceType: 'zorgon',
    isImposter: true,
    dialogueLines: [
      "Science Officer... Grix'an... Andromedan Research... Greetings...",
      "This is... totally... normal... research... data...",
      "Please... do not... listen too closely... to my... voice...",
    ],
  },
};

// Imposter names injected into the Pleiadian / Andromedan name pools
export const ZORGON_IMPOSTER_NAMES = [
  "Ambassador Vel'zar",
  "Diplomat Plex'nor",
  "Commander Thrak'el",
  "Science Officer Grix'an",
];

export function getCharacter(name: string): CharacterData {
  return (
    CHARACTERS[name] ?? {
      id: 'unknown',
      voiceType: 'human',
      dialogueLines: ['Transmission received.'],
    }
  );
}

export function pickDialogueLine(name: string): string {
  const char = getCharacter(name);
  return char.dialogueLines[Math.floor(Math.random() * char.dialogueLines.length)];
}

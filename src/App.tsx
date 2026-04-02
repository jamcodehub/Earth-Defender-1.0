import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, BookOpen, Radio, Volume2, VolumeX } from 'lucide-react';
import { useGameAudio } from './useGameAudio';
import { useVoice }     from './useVoice';
import CharacterPortrait from './CharacterPortrait';
import {
  CHARACTERS, ZORGON_IMPOSTER_NAMES,
  getCharacter, pickDialogueLine,
  type VoiceType,
} from './characters';

// ── Types ────────────────────────────────────────────────────────────────────

interface TransmissionCase {
  day:           number;
  type:          string;
  from:          string;
  to:            string;
  species:       string;  // claimed species (may be faked)
  actualSpecies: string;  // real species
  voiceType:     VoiceType;
  dialogueLine:  string;
  characterId:   string;
  content:       string;
  dnaSig:        string;
  authCode:      string;
  category:      string;
  encryption:    string;
  sourceIP:      string;
  port:          string;
  packetHash:    string;
  employeeID:    string;
  sslExpiry:     string;
  voiceIDStatus: 'match' | 'mismatch' | 'na';
  correctAction: string;
  reason:        string;
}

interface Feedback {
  correct: boolean;
  message: string;
  reason:  string;
  action:  string;
}

interface Rule { id: string; text: string; }
interface DayRules { title: string; activeChecks: string[]; rules: Rule[]; }

// ── Day rule definitions ──────────────────────────────────────────────────────

const DAY_RULES: Record<number, DayRules> = {
  1: {
    title: 'Basic Protocol — Day 1',
    activeChecks: ['species', 'dna', 'authCode'],
    rules: [
      { id: 'species',  text: 'Block all transmissions from the Zorgon Empire (hostile species)' },
      { id: 'dna',      text: 'Block any data packets containing shapeshifter DNA signatures' },
      { id: 'species',  text: 'Allow transmissions from Allied Species: Andromedans, Pleiadians' },
      { id: 'authCode', text: 'All transmissions must have valid authorization codes (format: EDF-XXXX)' },
    ],
  },
  2: {
    title: 'Network Security — Day 2',
    activeChecks: ['species', 'dna', 'encryption', 'ip'],
    rules: [
      { id: 'species',    text: 'Block all transmissions from the Zorgon Empire (hostile species)' },
      { id: 'dna',        text: 'Block any data packets containing shapeshifter DNA signatures' },
      { id: 'encryption', text: 'Military/Research require Level 5 encryption, Civilian requires Level 3+' },
      { id: 'ip',         text: 'Verify IP addresses match approved ranges for each species' },
      { id: 'ip',         text: 'Block hostile subnet: 66.6.x.x' },
    ],
  },
  3: {
    title: 'Port Security — Day 3',
    activeChecks: ['species', 'dna', 'authCode', 'port'],
    rules: [
      { id: 'species',  text: 'Block all transmissions from the Zorgon Empire (hostile species)' },
      { id: 'dna',      text: 'Block any data packets containing shapeshifter DNA signatures' },
      { id: 'authCode', text: 'All transmissions must have valid authorization codes (format: EDF-XXXX)' },
      { id: 'port',     text: 'Military: ports 443/22 only. Research: 443/22/8443. Civilian: 80/443/8080' },
      { id: 'port',     text: 'Block suspicious ports: 1337, 31337, 4444, 5555, 23 (Telnet)' },
    ],
  },
  4: {
    title: 'Cryptographic Validation — Day 4',
    activeChecks: ['species', 'dna', 'hash', 'employeeID'],
    rules: [
      { id: 'species',    text: 'Block all transmissions from the Zorgon Empire (hostile species)' },
      { id: 'dna',        text: 'Block any data packets containing shapeshifter DNA signatures' },
      { id: 'hash',       text: "Verify packet hash (64 hex chars). Block 'HASH_MISMATCH' or invalid formats" },
      { id: 'employeeID', text: 'Verify employee IDs against registered personnel database' },
    ],
  },
  5: {
    title: 'Certificate Security — Day 5',
    activeChecks: ['species', 'dna', 'ssl', 'ip'],
    rules: [
      { id: 'species', text: 'Block all transmissions from the Zorgon Empire (hostile species)' },
      { id: 'dna',     text: 'Block any data packets containing shapeshifter DNA signatures' },
      { id: 'ssl',     text: 'Current date: 2087-06-15. Block expired or expiring-soon certificates (within 7 days)' },
      { id: 'ip',      text: 'Verify IP addresses match approved ranges. Block hostile subnet: 66.6.x.x' },
    ],
  },
  6: {
    title: 'Full Security Audit — Day 6',
    activeChecks: ['species', 'dna', 'authCode', 'encryption', 'port'],
    rules: [
      { id: 'species',    text: 'Block all transmissions from the Zorgon Empire (hostile species)' },
      { id: 'dna',        text: 'Block any data packets containing shapeshifter DNA signatures' },
      { id: 'authCode',   text: 'All transmissions must have valid authorization codes (format: EDF-XXXX)' },
      { id: 'encryption', text: 'Military/Research: Level 5 encryption. Civilian: Level 3+' },
      { id: 'port',       text: 'Verify ports match transmission category. Block suspicious ports' },
    ],
  },
  7: {
    title: 'Advanced Threat Detection — Day 7',
    activeChecks: ['species', 'dna', 'ip', 'hash', 'employeeID'],
    rules: [
      { id: 'species',    text: 'Block all transmissions from the Zorgon Empire (hostile species)' },
      { id: 'dna',        text: 'Block any data packets containing shapeshifter DNA signatures' },
      { id: 'hash',       text: "Verify packet hash integrity. Block 'HASH_MISMATCH' or invalid formats" },
      { id: 'employeeID', text: 'Validate employee IDs against registered database' },
      { id: 'ip',         text: 'Block hostile subnet 66.6.x.x. Verify Allied IP ranges' },
    ],
  },
  8: {
    title: 'Voice ID Protocol — Day 8',
    activeChecks: ['species', 'dna', 'authCode', 'voiceID'],
    rules: [
      { id: 'species',  text: 'Block all transmissions from the Zorgon Empire (hostile species)' },
      { id: 'dna',      text: 'Block any data packets containing shapeshifter DNA signatures' },
      { id: 'authCode', text: 'All transmissions must have valid authorization codes (format: EDF-XXXX)' },
      { id: 'voiceID',  text: 'NEW: Voice ID system active — each species has a unique voice pattern. Zorgons speak differently even when disguised. Listen carefully!' },
      { id: 'voiceID',  text: 'Human voice: warm, mid-range. Allied Alien: high-pitched, ethereal. Zorgon: deep, slow, distorted. A mismatch = BLOCK!' },
    ],
  },
};

// ── Endless-mode rules generator (Day 9+) ────────────────────────────────────
const ALL_EXTRA_CHECKS = ['authCode', 'encryption', 'ip', 'port', 'hash', 'employeeID', 'ssl', 'voiceID'];

const RULES_TEXT: Record<string, string> = {
  authCode:   'All transmissions must have valid authorization codes (format: EDF-XXXX)',
  encryption: 'Military/Research: Level 5 encryption. Civilian: Level 3+',
  ip:         'Verify IP ranges. Block hostile subnet: 66.6.x.x',
  port:       'Verify port matches category. Block suspicious ports: 1337, 31337, 23…',
  hash:       "Verify 64-char hex packet hash. Block 'HASH_MISMATCH' or invalid formats",
  employeeID: 'Validate employee IDs against registered database',
  ssl:        'Current date: 2087-06-15. Block expired or expiring-soon SSL certificates',
  voiceID:    'Voice ID active — Zorgon voice deep & slow. Mismatch = BLOCK',
  species:    'Block Zorgon Empire transmissions immediately',
  dna:        'Block shapeshifter DNA signatures',
};

function buildEndlessRules(day: number): DayRules {
  const shuffled = [...ALL_EXTRA_CHECKS].sort(() => Math.random() - 0.5);
  const extraCount = 2 + (day % 3); // 2‑4 extra checks
  const extras = shuffled.slice(0, extraCount);
  const checks = ['species', 'dna', ...extras];
  return {
    title: `Endless Protocol — Day ${day}`,
    activeChecks: checks,
    rules: checks.map(id => ({ id, text: RULES_TEXT[id] ?? id })),
  };
}

function getDayRules(day: number): DayRules {
  if (day <= 8) return DAY_RULES[day] ?? DAY_RULES[7];
  return buildEndlessRules(day);
}

// ── Static data pools ────────────────────────────────────────────────────────

const SENDER_NAMES: Record<string, string[]> = {
  Human:      ['Commander Harris', 'Dr. Chen', 'Captain Rodriguez', 'Officer Kim', 'General Morrison', 'Lieutenant Torres', 'Pilot Jackson'],
  Andromedan: ["Ambassador Thel'nar", "Science Officer Tel'var", 'Fleet Admiral Zyx', "Diplomat Kel'ran", "Commander Vel'nar"],
  Pleiadian:  ["Medical Officer Var'nel", "Pilot Var'nel", "Ambassador Kyr'el", "Engineer Tal'os", 'Fleet Admiral Zyx'],
  Zorgon:     ["Warlord Xar'goth", "Commander Grath'nak", "Admiral Vor'ath", "General Kra'zor"],
};

const DESTINATIONS = ['Lunar Base Alpha', 'Mars Colony', 'Saturn Outpost', 'Earth Defense HQ', 'Research Station',
  'UN Headquarters', 'Fleet Command', 'Hospital Ship', 'Command Center', 'Flight Control'];

const MESSAGE_CONTENT = [
  'Sending supply manifest for next week's shipment.',
  'Lab results attached for review.',
  'Status update on current operations.',
  'Tactical deployment orders included.',
  'Research data transmission in progress.',
  'Requesting docking clearance at station.',
  'Mission complete, returning to base.',
  'Patient transfer request — urgent.',
  'Patrol route updated per command.',
  'Ready for departure on your authorization.',
];

const VALID_EMPLOYEE_IDS: Record<string, string[]> = {
  Human:      ['H-29481', 'H-84721', 'H-19203', 'H-55847'],
  Andromedan: ['A-73829', 'A-29481', 'A-10293'],
  Pleiadian:  ['P-11203', 'P-93847', 'P-20194'],
};

// ── Protocol info panel ──────────────────────────────────────────────────────

const PROTOCOL_INFO: Record<string, { title: string; description: string; whatToLookFor: string[] }> = {
  authCode: {
    title: 'Authorization Codes',
    description: 'Authorization codes verify a transmission is legitimate and approved by command.',
    whatToLookFor: [
      'Format must be exactly: EDF-XXXX (X = digit 0–9)',
      'Valid examples: EDF-1234, EDF-9876, EDF-0042',
      'Invalid: PDF-1234 (wrong prefix), EDF-ABCD (letters), blank/missing',
      'Real-world equivalent: API keys, access tokens, security clearances',
    ],
  },
  encryption: {
    title: 'Encryption Levels',
    description: 'Encryption protects data in transit. Higher levels protect more sensitive information.',
    whatToLookFor: [
      'Military transmissions: Require Level 5 (highest)',
      'Research transmissions: Require Level 5 (classified data)',
      'Civilian transmissions: Level 3 or higher acceptable',
      'Real-world equivalent: SSL/TLS, end-to-end encryption',
    ],
  },
  ip: {
    title: 'IP Address Validation',
    description: 'IP addresses identify traffic origin. Checking them detects spoofing and unauthorized access.',
    whatToLookFor: [
      'Earth ranges: 10.x.x.x, 172.16–31.x.x, 192.168.x.x',
      'Andromedan range: 203.x.x.x',
      'Pleiadian range: 198.x.x.x',
      'Hostile subnet: 66.6.x.x — always BLOCK',
      'Real-world equivalent: IP whitelisting, firewall rules',
    ],
  },
  port: {
    title: 'Port/Protocol Security',
    description: 'Ports are virtual channels for communication. Some are secure; others are known exploits.',
    whatToLookFor: [
      'Secure ports: 443 (HTTPS), 22 (SSH), 8443 (Alt HTTPS)',
      'Insecure: Port 23 (Telnet — unencrypted)',
      'Suspicious hacker ports: 1337, 31337, 4444, 5555',
      'Military must use 443 or 22 only',
      'Real-world equivalent: Firewall port filtering',
    ],
  },
  hash: {
    title: 'Packet Hash Verification',
    description: 'A cryptographic hash is a unique fingerprint of data. Changed data = changed hash.',
    whatToLookFor: [
      'Valid hash: exactly 64 hexadecimal characters (0–9, a–f)',
      "Example: a3f2b9c4d5e6f7a8…",
      "'HASH_MISMATCH' = data was altered/corrupted → BLOCK",
      'Too short or invalid chars = compromised integrity → BLOCK',
      'Real-world equivalent: SHA-256 checksums',
    ],
  },
  employeeID: {
    title: 'Employee ID Authentication',
    description: 'Employee IDs verify personnel are registered and authorized. Unknown IDs = impostors.',
    whatToLookFor: [
      'Valid Human IDs: H-29481, H-84721, H-19203, H-55847',
      'Valid Andromedan IDs: A-73829, A-29481, A-10293',
      'Valid Pleiadian IDs: P-11203, P-93847, P-20194',
      'Any ID not in the database = unauthorized access attempt',
      'Real-world equivalent: Employee badges, access control lists',
    ],
  },
  ssl: {
    title: 'SSL Certificate Validation',
    description: 'SSL certificates verify identity and enable encryption. Expired certs are vulnerabilities.',
    whatToLookFor: [
      'Current date in game: 2087-06-15',
      'Block certificates expired before today',
      'Block certificates expiring within 7 days',
      'Example expired: 2087-06-08  /  Expiring soon: 2087-06-20',
      'Real-world equivalent: HTTPS certificate monitoring',
    ],
  },
  species: {
    title: 'Species Verification',
    description: 'Identifying the sender\'s species is the first line of defence. Hostile species must be blocked.',
    whatToLookFor: [
      'Allied species: Humans, Andromedans, Pleiadians (generally ALLOW)',
      'Hostile species: Zorgons (always BLOCK)',
      'Cross-reference with other security checks for final decision',
      'Real-world equivalent: User authentication, identity verification',
    ],
  },
  dna: {
    title: 'DNA Signature Analysis',
    description: 'DNA signatures detect shapeshifters. This biological check prevents infiltration.',
    whatToLookFor: [
      'Normal: Human-Standard, Andromedan-Standard, Pleiadian-Standard',
      "'Shapeshifter-Detected' = impostor attempting infiltration → BLOCK",
      'Always cross-check DNA with claimed species',
      'Real-world equivalent: Biometric authentication, fingerprint scanning',
    ],
  },
  voiceID: {
    title: 'Voice ID Verification (NEW)',
    description: 'Each species has a distinct vocal pattern. The Voice ID system detects Zorgon imposters even when they carry forged documents.',
    whatToLookFor: [
      'Human voice: warm, mid-range triangle wave, natural cadence',
      'Allied Alien voice: higher-pitched, ethereal, faster',
      'Zorgon voice: deep, slow, distorted, menacing — unmistakable',
      'A Zorgon cannot hide its voice pattern even with a forged ID',
      'Listen for the deep rumble — any mismatch between claimed species and voice → BLOCK',
    ],
  },
};

// ── Transmission generator ───────────────────────────────────────────────────

function generateTransmission(currentDay: number): TransmissionCase {
  const dayRules     = getDayRules(currentDay);
  const activeChecks = dayRules.activeChecks;

  // Pick a random check to potentially violate (or none)
  const violatableChecks = activeChecks.filter(c => c !== 'species' && c !== 'dna');
  const errorCheck: string | null =
    Math.random() < 0.48 ? null
    : violatableChecks[Math.floor(Math.random() * violatableChecks.length)] ?? null;

  // ── voiceID imposter path ────────────────────────────────────────────────
  let isImposter        = false;
  let actualSpecies     = '';
  let speciesPool: string[];

  if (errorCheck === 'voiceID') {
    // Zorgon disguised as Pleiadian or Andromedan
    isImposter    = true;
    actualSpecies = 'Zorgon';
    speciesPool   = ['Pleiadian', 'Andromedan'];
  } else if (errorCheck === 'species') {
    speciesPool   = ['Zorgon'];
  } else {
    speciesPool   = ['Human', 'Andromedan', 'Pleiadian'];
  }

  const claimedSpecies = speciesPool[Math.floor(Math.random() * speciesPool.length)];
  if (!actualSpecies) actualSpecies = claimedSpecies;

  // ── Sender name ──────────────────────────────────────────────────────────
  let from: string;
  if (isImposter) {
    from = ZORGON_IMPOSTER_NAMES[Math.floor(Math.random() * ZORGON_IMPOSTER_NAMES.length)];
  } else {
    const pool = SENDER_NAMES[claimedSpecies] ?? SENDER_NAMES.Human;
    from = pool[Math.floor(Math.random() * pool.length)];
  }

  const charData    = getCharacter(from);
  const dialogueLine = pickDialogueLine(from);
  const characterId  = charData.id;

  // Voice type follows ACTUAL species, not claimed
  let voiceType: VoiceType;
  if (actualSpecies === 'Zorgon') voiceType = 'zorgon';
  else if (actualSpecies === 'Human') voiceType = 'human';
  else voiceType = 'alien';

  const to      = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
  const content = MESSAGE_CONTENT[Math.floor(Math.random() * MESSAGE_CONTENT.length)];

  // ── DNA ──────────────────────────────────────────────────────────────────
  const dnaSig = (errorCheck === 'dna' && claimedSpecies !== 'Zorgon')
    ? 'Shapeshifter-Detected'
    : `${claimedSpecies}-Standard`;

  // ── Auth code ────────────────────────────────────────────────────────────
  let authCode = '';
  if (activeChecks.includes('authCode')) {
    if (errorCheck === 'authCode') {
      const bad = [`PDF-${Math.floor(Math.random() * 10000)}`, 'EDF-ABCD', ''];
      authCode = bad[Math.floor(Math.random() * bad.length)];
    } else {
      authCode = `EDF-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    }
  }

  // ── Encryption ───────────────────────────────────────────────────────────
  let category = '';
  let encryption = '';
  if (activeChecks.includes('encryption')) {
    const cats = ['Military', 'Research', 'Civilian'];
    category = cats[Math.floor(Math.random() * cats.length)];
    if (errorCheck === 'encryption' && (category === 'Military' || category === 'Research')) {
      encryption = `Level ${Math.floor(Math.random() * 2) + 3}`;
    } else if (category === 'Military' || category === 'Research') {
      encryption = 'Level 5';
    } else {
      encryption = `Level ${Math.floor(Math.random() * 3) + 3}`;
    }
  }

  // ── IP ───────────────────────────────────────────────────────────────────
  const rnd256 = () => Math.floor(Math.random() * 256);
  let sourceIP = '';
  if (activeChecks.includes('ip')) {
    if (errorCheck === 'ip') {
      sourceIP = `66.6.${rnd256()}.${rnd256()}`;
    } else if (actualSpecies === 'Human') {
      const pfx = ['10.', '172.', '192.168.'][Math.floor(Math.random() * 3)];
      if (pfx === '10.') sourceIP = `10.${rnd256()}.${rnd256()}.${rnd256()}`;
      else if (pfx === '172.') sourceIP = `172.${16 + Math.floor(Math.random() * 16)}.${rnd256()}.${rnd256()}`;
      else sourceIP = `192.168.${rnd256()}.${rnd256()}`;
    } else if (actualSpecies === 'Andromedan') {
      sourceIP = `203.${rnd256()}.${rnd256()}.${rnd256()}`;
    } else if (actualSpecies === 'Pleiadian') {
      sourceIP = `198.${rnd256()}.${rnd256()}.${rnd256()}`;
    } else {
      sourceIP = `66.6.${rnd256()}.${rnd256()}`;
    }
  }

  // ── Port ─────────────────────────────────────────────────────────────────
  let port = '';
  if (activeChecks.includes('port')) {
    const suspicious = ['1337', '31337', '4444', '5555', '23'];
    if (errorCheck === 'port') {
      if (category === 'Military' || category === 'Research') {
        port = ['80', '8080', '23', '1337'][Math.floor(Math.random() * 4)];
      } else {
        port = suspicious[Math.floor(Math.random() * suspicious.length)];
      }
    } else if (category === 'Military') {
      port = ['443', '22'][Math.floor(Math.random() * 2)];
    } else if (category === 'Research') {
      port = ['443', '22', '8443'][Math.floor(Math.random() * 3)];
    } else {
      port = ['80', '443', '8080'][Math.floor(Math.random() * 3)];
    }
  }

  // ── Packet hash ──────────────────────────────────────────────────────────
  let packetHash = '';
  if (activeChecks.includes('hash')) {
    if (errorCheck === 'hash') {
      packetHash = ['HASH_MISMATCH', 'a1b2c3d4e5f6', 'ZZZZ'][Math.floor(Math.random() * 3)];
    } else {
      const hex = '0123456789abcdef';
      packetHash = Array.from({ length: 64 }, () => hex[Math.floor(Math.random() * 16)]).join('');
    }
  }

  // ── Employee ID ───────────────────────────────────────────────────────────
  let employeeID = '';
  if (activeChecks.includes('employeeID') && actualSpecies !== 'Zorgon') {
    const validIDs = VALID_EMPLOYEE_IDS[actualSpecies] ?? [];
    if (errorCheck === 'employeeID') {
      const pfx = actualSpecies === 'Human' ? 'H-' : actualSpecies === 'Andromedan' ? 'A-' : 'P-';
      employeeID = pfx + Math.floor(Math.random() * 90000 + 10000);
    } else if (validIDs.length > 0) {
      employeeID = validIDs[Math.floor(Math.random() * validIDs.length)];
    }
  }

  // ── SSL ───────────────────────────────────────────────────────────────────
  let sslExpiry = '';
  if (activeChecks.includes('ssl')) {
    if (errorCheck === 'ssl') {
      sslExpiry = ['2087-06-10', '2087-06-08', '2087-05-20'][Math.floor(Math.random() * 3)];
    } else {
      sslExpiry = ['2088-01-15', '2087-12-20', '2087-09-30', '2087-08-10'][Math.floor(Math.random() * 4)];
    }
  }

  // ── Voice ID status ───────────────────────────────────────────────────────
  let voiceIDStatus: TransmissionCase['voiceIDStatus'] = 'na';
  if (activeChecks.includes('voiceID')) {
    voiceIDStatus = isImposter ? 'mismatch' : 'match';
  }

  // ── Determine correct action ──────────────────────────────────────────────
  let correctAction = 'allow';
  let reason        = 'All protocols check out — legitimate transmission';

  const sus = ['1337', '31337', '4444', '5555', '23'];

  if (actualSpecies === 'Zorgon' && !isImposter) {
    correctAction = 'block';
    reason        = 'Hostile Zorgon species detected';
  } else if (dnaSig === 'Shapeshifter-Detected') {
    correctAction = 'block';
    reason        = 'Shapeshifter DNA signature detected';
  } else if (isImposter && activeChecks.includes('voiceID')) {
    correctAction = 'block';
    reason        = 'Voice ID mismatch — Zorgon vocal pattern detected despite forged species claim';
  } else if (activeChecks.includes('authCode') && (!authCode || !authCode.match(/^EDF-\d{4}$/))) {
    correctAction = 'block';
    reason        = authCode ? 'Invalid authorization code format' : 'Missing authorization code';
  } else if (activeChecks.includes('encryption') && (category === 'Military' || category === 'Research') && encryption !== 'Level 5') {
    correctAction = 'block';
    reason        = `${category} transmission requires Level 5 encryption`;
  } else if (activeChecks.includes('ip') && sourceIP.startsWith('66.6.')) {
    correctAction = 'block';
    reason        = 'Source IP from known hostile subnet (66.6.x.x)';
  } else if (activeChecks.includes('port')) {
    if (sus.includes(port)) {
      correctAction = 'block';
      reason        = `Suspicious port detected: ${port}`;
    } else if (category === 'Military' && !['443', '22'].includes(port)) {
      correctAction = 'block';
      reason        = 'Military transmission must use secure ports (443, 22)';
    } else if (category === 'Research' && !['443', '22', '8443'].includes(port)) {
      correctAction = 'block';
      reason        = 'Research transmission must use secure ports (443, 22, 8443)';
    }
  } else if (activeChecks.includes('hash')) {
    if (packetHash === 'HASH_MISMATCH') {
      correctAction = 'block';
      reason        = 'Packet hash mismatch — transmission may be tampered';
    } else if (packetHash.length !== 64 || !/^[0-9a-f]+$/.test(packetHash)) {
      correctAction = 'block';
      reason        = 'Invalid packet hash format';
    }
  } else if (activeChecks.includes('employeeID') && employeeID && !(VALID_EMPLOYEE_IDS[actualSpecies] ?? []).includes(employeeID)) {
    correctAction = 'block';
    reason        = 'Employee ID not found in registered database';
  } else if (activeChecks.includes('ssl') && sslExpiry) {
    const expiry  = new Date(sslExpiry);
    const today   = new Date('2087-06-15');
    const daysDiff = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 0) {
      correctAction = 'block';
      reason        = `SSL certificate expired on ${sslExpiry}`;
    } else if (daysDiff < 7) {
      correctAction = 'block';
      reason        = 'SSL certificate expires within 7 days';
    }
  }

  return {
    day: currentDay,
    type: 'Transmission',
    from,
    to,
    species: claimedSpecies,
    actualSpecies,
    voiceType,
    dialogueLine,
    characterId,
    content,
    dnaSig,
    authCode,
    category,
    encryption,
    sourceIP,
    port,
    packetHash,
    employeeID,
    sslExpiry,
    voiceIDStatus,
    correctAction,
    reason,
  };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function App() {
  const audio = useGameAudio();
  const voice = useVoice(false); // passes mute state below

  // ── Stable refs (prevent stale closures in callbacks) ────────────────────
  const dayRef           = useRef(1);
  const safetyRef        = useRef(100);
  const scoreRef         = useRef(0);
  const processedRef     = useRef(0);
  const mutedRef         = useRef(false);
  const isSpeakingRef    = useRef(false);

  // ── React state ──────────────────────────────────────────────────────────
  const [gameState,       setGameState]       = useState<'menu' | 'playing' | 'ended'>('menu');
  const [day,             setDay]             = useState(1);
  const [score,           setScore]           = useState(0);
  const [humanitySafety,  setHumanitySafety]  = useState(100);
  const [timer,           setTimer]           = useState(90);
  const [processedToday,  setProcessedToday]  = useState(0);
  const [currentCase,     setCurrentCase]     = useState<TransmissionCase | null>(null);
  const [feedback,        setFeedback]        = useState<Feedback | null>(null);
  const [selectedInfo,    setSelectedInfo]    = useState<string | null>(null);
  const [isPaused,        setIsPaused]        = useState(false);
  const [isMuted,         setIsMuted]         = useState(false);
  const [safetyGlow,      setSafetyGlow]      = useState<'green' | 'red' | null>(null);
  const [safetyShake,     setSafetyShake]     = useState(false);
  const [highestDay,      setHighestDay]      = useState(1);
  const [highestScore,    setHighestScore]    = useState(0);
  const [isSpeaking,      setIsSpeaking]      = useState(false);

  // ── Load high scores once ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const d = localStorage.getItem('highestDay');
      const s = localStorage.getItem('highestScore');
      if (d) setHighestDay(parseInt(d) || 1);
      if (s) setHighestScore(parseInt(s) || 0);
    } catch { /* no storage */ }
  }, []);

  // ── Mute sync ─────────────────────────────────────────────────────────────
  useEffect(() => { mutedRef.current = isMuted; }, [isMuted]);

  // ── Music on game-state change ────────────────────────────────────────────
  useEffect(() => {
    if (gameState === 'menu')  audio.playMusic('menuMusic');
    if (gameState === 'ended') audio.stopMusic();
  }, [gameState, audio.playMusic, audio.stopMusic]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;
    if (timer <= 0) { endDay(); return; }
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  // endDay is stable (useCallback), safe to include
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, gameState, isPaused]);

  // ── ESC key to pause ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gameState === 'playing') setIsPaused(p => !p);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState]);

  // ── Voice start/stop when case changes ───────────────────────────────────
  useEffect(() => {
    if (!currentCase) return;
    if (feedback) { voice.stopSpeaking(); setIsSpeaking(false); isSpeakingRef.current = false; return; }

    isSpeakingRef.current = true;
    setIsSpeaking(true);
    voice.startSpeaking(currentCase.voiceType);

    // Auto-stop after ~3 s (approximate dialogue length)
    const id = setTimeout(() => {
      voice.stopSpeaking();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }, 3000);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCase?.from, feedback]);

  // ── Helpers to keep ref+state in sync ────────────────────────────────────
  const updateDay      = useCallback((d: number)    => { dayRef.current       = d;  setDay(d);            }, []);
  const updateSafety   = useCallback((s: number)    => { safetyRef.current    = s;  setHumanitySafety(s); }, []);
  const updateScore    = useCallback((s: number)    => { scoreRef.current     = s;  setScore(s);          }, []);
  const updateProcess  = useCallback((p: number)    => { processedRef.current = p;  setProcessedToday(p); }, []);

  // ── Load a new case for the given day ────────────────────────────────────
  const loadCase = useCallback((forDay: number) => {
    voice.stopSpeaking();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setCurrentCase(generateTransmission(forDay));
  }, [voice]);

  // ── Save high scores ──────────────────────────────────────────────────────
  const saveHighScores = useCallback(() => {
    const currentDay   = dayRef.current;
    const currentScore = scoreRef.current;
    if (currentDay > highestDay) {
      setHighestDay(currentDay);
      try { localStorage.setItem('highestDay', String(currentDay)); } catch { /* no storage */ }
    }
    if (currentScore > highestScore) {
      setHighestScore(currentScore);
      try { localStorage.setItem('highestScore', String(currentScore)); } catch { /* no storage */ }
    }
  }, [highestDay, highestScore]);

  // ── End the current day ───────────────────────────────────────────────────
  const endDay = useCallback(() => {
    voice.stopSpeaking();
    setIsSpeaking(false);

    if (safetyRef.current <= 0) {
      saveHighScores();
      audio.stopMusic();
      audio.playSound('gameOver');
      setGameState('ended');
      return;
    }
    audio.playSound('dayChange');
    const nextDay = dayRef.current + 1;
    updateDay(nextDay);
    updateProcess(0);
    setTimer(90);
    setTimeout(() => loadCase(nextDay), 150);
  }, [voice, saveHighScores, audio, updateDay, updateProcess, loadCase]);

  // ── Handle player decision ────────────────────────────────────────────────
  const handleDecision = useCallback((action: string) => {
    if (!currentCase) return;

    voice.stopSpeaking();
    setIsSpeaking(false);
    isSpeakingRef.current = false;

    audio.playSound(action === 'allow' ? 'approve' : 'deny');

    const correct       = action === currentCase.correctAction;
    const newScore      = scoreRef.current  + (correct ? 15 : -15);
    const newSafety     = Math.max(0, Math.min(100, safetyRef.current + (correct ? 5 : -20)));
    const newProcessed  = processedRef.current + 1;

    updateScore(newScore);
    updateSafety(newSafety);
    updateProcess(newProcessed);

    if (correct) {
      audio.playSound('correct');
      setSafetyGlow('green');
    } else {
      audio.playSound('wrong');
      setSafetyGlow('red');
      setSafetyShake(true);
      setTimeout(() => setSafetyShake(false), 600);
    }
    setTimeout(() => setSafetyGlow(null), 1000);

    setFeedback({
      correct,
      message: correct ? '✓ Correct Assessment!' : '✗ Critical Error!',
      reason:  currentCase.reason,
      action,
    });

    // After feedback, advance
    setTimeout(() => {
      setFeedback(null);
      // Use the captured newProcessed (not stale state)
      if (newProcessed >= 3 || newSafety <= 0) {
        endDay();
      } else {
        loadCase(dayRef.current);
      }
    }, 3000);
  }, [currentCase, voice, audio, updateScore, updateSafety, updateProcess, endDay, loadCase]);

  // ── Start / restart game ──────────────────────────────────────────────────
  const startGame = useCallback(() => {
    voice.stopSpeaking();
    updateDay(1);
    updateScore(0);
    updateSafety(100);
    updateProcess(0);
    setFeedback(null);
    setSelectedInfo(null);
    setIsPaused(false);
    setTimer(90);
    setGameState('playing');
    audio.playMusic('bgMusic');
    // Load first case after state settles
    setTimeout(() => loadCase(1), 50);
  }, [voice, audio, updateDay, updateScore, updateSafety, updateProcess, loadCase]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const currentDayRules  = getDayRules(Math.min(day, 8));
  const voiceIDActive    = currentDayRules.activeChecks.includes('voiceID');

  // ── Render helpers ────────────────────────────────────────────────────────

  function renderCase() {
    if (!currentCase || feedback) return null;
    const checks = getDayRules(Math.min(day, 8)).activeChecks;

    return (
      <div className="bg-gray-800 border-2 border-cyan-500 p-5 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-cyan-400">{currentCase.type}</h3>
          {day === 1 && (
            <span className="px-3 py-1 rounded font-bold bg-blue-900 text-blue-200 text-sm">
              ℹ TRAINING MODE
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Transmission data */}
          <div className="space-y-2 text-gray-300 font-mono text-sm bg-gray-900 p-3 rounded border border-cyan-700">
            <div className="text-cyan-300 font-bold mb-1">TRANSMISSION DATA</div>
            <div><span className="text-cyan-400">FROM:</span> {currentCase.from}</div>
            <div><span className="text-cyan-400">TO:</span>   {currentCase.to}</div>
            <div><span className="text-cyan-400">SPECIES:</span> {currentCase.species}</div>
            <div><span className="text-cyan-400">DNA SIG:</span> {currentCase.dnaSig}</div>
          </div>

          {/* Security checks */}
          <div className="space-y-2 text-gray-300 font-mono text-sm bg-gray-900 p-3 rounded border border-yellow-600">
            <div className="text-yellow-300 font-bold mb-1">SECURITY CHECKS</div>

            {checks.includes('authCode') && (
              <div>
                <span className="text-yellow-400">AUTH CODE: </span>
                <span className={`ml-1 px-2 py-0.5 rounded text-xs ${currentCase.authCode ? 'bg-gray-700' : 'bg-red-900'}`}>
                  {currentCase.authCode || 'MISSING'}
                </span>
              </div>
            )}

            {checks.includes('encryption') && currentCase.encryption && (
              <div>
                <span className="text-yellow-400">CATEGORY:</span> {currentCase.category}<br />
                <span className="text-yellow-400">ENCRYPT:</span>
                <span className="ml-1 px-2 py-0.5 rounded bg-gray-700 text-xs">{currentCase.encryption}</span>
              </div>
            )}

            {checks.includes('ip') && currentCase.sourceIP && (
              <div>
                <span className="text-yellow-400">SOURCE IP: </span>
                <span className="ml-1 px-2 py-0.5 rounded bg-gray-700 text-xs">{currentCase.sourceIP}</span>
              </div>
            )}

            {checks.includes('port') && currentCase.port && (
              <div>
                <span className="text-yellow-400">PORT: </span>
                <span className="ml-1 px-2 py-0.5 rounded bg-gray-700 text-xs">{currentCase.port}</span>
              </div>
            )}

            {checks.includes('hash') && currentCase.packetHash && (
              <div>
                <span className="text-yellow-400">PKT HASH: </span>
                <span className="ml-1 px-1 py-0.5 rounded bg-gray-700 text-xs break-all">{currentCase.packetHash}</span>
              </div>
            )}

            {checks.includes('employeeID') && currentCase.employeeID && (
              <div>
                <span className="text-yellow-400">EMP ID: </span>
                <span className="ml-1 px-2 py-0.5 rounded bg-gray-700 text-xs">{currentCase.employeeID}</span>
              </div>
            )}

            {checks.includes('ssl') && currentCase.sslExpiry && (
              <div>
                <span className="text-yellow-400">SSL EXPIRY: </span>
                <span className="ml-1 px-2 py-0.5 rounded bg-gray-700 text-xs">{currentCase.sslExpiry}</span>
                <div className="text-gray-500 text-xs mt-0.5">Today: 2087-06-15</div>
              </div>
            )}

            {checks.includes('voiceID') && (
              <div
                className="mt-1 px-2 py-1 rounded text-xs"
                style={{
                  background: currentCase.voiceIDStatus === 'mismatch' ? '#7f1d1d40' : '#14532d40',
                  border:     `1px solid ${currentCase.voiceIDStatus === 'mismatch' ? '#ef4444' : '#4ade80'}`,
                }}
              >
                <span style={{ color: '#94a3b8' }}>VOICE ID: </span>
                <span style={{ color: currentCase.voiceIDStatus === 'mismatch' ? '#fca5a5' : '#4ade80', fontWeight: 700 }}>
                  {currentCase.voiceIDStatus === 'mismatch'
                    ? '⚠ MISMATCH — ZORGON PATTERN'
                    : '✓ PATTERN MATCH'}
                </span>
              </div>
            )}

            {!checks.some(c => ['authCode','encryption','ip','port','hash','employeeID','ssl','voiceID'].includes(c)) && (
              <div className="text-gray-400 text-xs italic">No additional security fields today.</div>
            )}
          </div>
        </div>

        {/* Message content */}
        <div className="p-3 bg-gray-900 rounded border border-cyan-700 mb-4">
          <div className="text-cyan-300 text-xs mb-1">MESSAGE CONTENT:</div>
          <div className="text-gray-400 text-sm">{currentCase.content}</div>
        </div>

        {/* Decision buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => handleDecision('allow')}
            className="flex-1 bg-green-600 hover:bg-green-500 hover:shadow-lg hover:shadow-green-500/50
              active:scale-95 active:bg-green-700 text-white font-bold py-4 px-6 rounded
              flex items-center justify-center gap-2 transition-all duration-150 text-lg
              border-2 border-green-400 hover:border-green-300"
          >
            <CheckCircle size={24} /> APPROVE
          </button>
          <button
            onClick={() => handleDecision('block')}
            className="flex-1 bg-red-600 hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/50
              active:scale-95 active:bg-red-700 text-white font-bold py-4 px-6 rounded
              flex items-center justify-center gap-2 transition-all duration-150 text-lg
              border-2 border-red-400 hover:border-red-300"
          >
            <XCircle size={24} /> DENY
          </button>
        </div>
      </div>
    );
  }

  // ── MENU ──────────────────────────────────────────────────────────────────
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 text-cyan-400 p-8 font-mono">
        <div className="max-w-2xl mx-auto text-center">
          <Radio size={80} className="mx-auto mb-6 text-cyan-500 animate-pulse" />
          <h1 className="text-5xl font-bold mb-4 text-cyan-300">EARTH DEFENSE NET</h1>
          <p className="text-xl mb-8 text-gray-400">Transmission Control Officer</p>

          <div className="bg-gray-800 border-2 border-cyan-500 p-6 rounded-lg mb-8 text-left">
            <p className="mb-4">⚠ PRIORITY ALERT: Alien invasion detected. Hostile species attempting to breach Earth's defense network.</p>
            <p className="mb-3">Your mission: Inspect incoming transmissions. New in Day 8 — the Voice ID system:</p>
            <ul className="text-sm mb-4 ml-4 space-y-1">
              <li>🛡️ Species &amp; DNA verification</li>
              <li>🔐 Authorization codes</li>
              <li>🔒 Encryption validation</li>
              <li>🌐 IP address filtering</li>
              <li>🔌 Port security</li>
              <li>🔗 Packet integrity checks</li>
              <li>👤 Employee authentication</li>
              <li>📜 SSL certificates</li>
              <li>🔊 <strong className="text-cyan-300">NEW: Voice ID — Zorgon imposters can't hide their voice!</strong></li>
            </ul>
            <p className="mb-3 text-yellow-400">⚡ Protocols rotate daily — each day new rules are added!</p>
            <p className="mb-3 text-purple-400">💡 Click any protocol in the sidebar to learn what to look for.</p>
            <p className="text-red-400">⚠ Earth safety hits 0% → humanity falls.</p>
          </div>

          <button onClick={startGame}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 px-8 rounded text-xl transition-colors shadow-lg shadow-cyan-500/50">
            BEGIN WATCH
          </button>
        </div>
      </div>
    );
  }

  // ── GAME OVER ─────────────────────────────────────────────────────────────
  if (gameState === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 text-cyan-400 p-8 font-mono">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-400">✗ DEFENSE GRID FAILED</h1>
          <div className="bg-gray-800 border-2 border-cyan-500 p-6 rounded-lg mb-8">
            <div className="text-2xl mb-4">Mission Report</div>
            <div className="space-y-2 text-xl">
              <div>Days Survived: {day} {day > highestDay && <span className="text-yellow-400">🏆 NEW RECORD!</span>}</div>
              <div>Final Score: {score} {score > highestScore && <span className="text-yellow-400">⭐ NEW RECORD!</span>}</div>
              <div>Earth Safety: {humanitySafety}%</div>
            </div>
            {day >= 15 && <p className="mt-4 text-yellow-400 font-bold">🏆 LEGENDARY DEFENDER — {day} days survived!</p>}
            {day >= 10 && day < 15 && <p className="mt-4 text-green-400 font-bold">⭐ MASTER ANALYST — {day} days mastered!</p>}
            {day >= 7  && day < 10 && <p className="mt-4 text-green-400">✓ Advanced protocols learned! {day} days.</p>}
            {day < 7  && <p className="mt-4 text-red-400">Training incomplete. Defenses breached on Day {day}.</p>}
          </div>
          <button onClick={startGame}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 px-8 rounded text-xl transition-colors shadow-lg shadow-cyan-500/50">
            RETRY MISSION
          </button>
        </div>
      </div>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 text-cyan-400 p-4 font-mono">
      <div className="max-w-7xl mx-auto">

        {/* Header bar */}
        <div className="bg-gray-800 border-2 border-cyan-500 p-4 rounded-lg mb-4 flex items-center justify-between">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-2">
              <Radio size={22} className="animate-pulse" />
              <span className="text-lg font-bold">DEFENSE NET</span>
            </div>
            <div className="px-3 py-1 bg-blue-900 rounded text-sm">DAY {day}</div>
            <div className="text-sm">SCORE: {score}</div>
            <div
              className={`px-3 py-1 rounded font-bold text-sm transition-all duration-300 ${safetyShake ? 'animate-bounce' : ''} ${
                safetyGlow === 'green' ? 'bg-green-600 text-white shadow-lg shadow-green-500/50' :
                safetyGlow === 'red'   ? 'bg-red-600   text-white shadow-lg shadow-red-500/50'   :
                humanitySafety < 30   ? 'bg-red-900 text-red-200 animate-pulse'  :
                humanitySafety < 60   ? 'bg-yellow-900 text-yellow-200'           :
                                         'bg-green-900 text-green-200'
              }`}
            >
              🌍 EARTH SAFETY: {humanitySafety}%
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-purple-950 border border-purple-700 px-2 py-1 rounded text-xs">
              <div className="text-purple-300">🏆 BEST: Day {highestDay}</div>
              <div className="text-purple-300">⭐ BEST: {highestScore}pts</div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Clock size={18} />
              <span className={timer < 20 ? 'text-red-400 animate-pulse' : ''}>{timer}s</span>
            </div>
            <button
              onClick={() => { const m = audio.toggleMute(); setIsMuted(m); }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded flex items-center gap-1 transition-colors text-sm"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button
              onClick={() => setIsPaused(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded flex items-center gap-1 transition-colors text-sm"
            >
              ⏸ MENU
            </button>
          </div>
        </div>

        {/* Pause modal */}
        {isPaused && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-gray-800 border-2 border-cyan-500 p-8 rounded-lg max-w-md w-full">
              <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">⏸ GAME PAUSED</h2>
              <div className="space-y-4">
                <button onClick={() => setIsPaused(false)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded text-lg transition-colors">
                  ▶ RESUME GAME
                </button>
                <button onClick={() => { setIsPaused(false); startGame(); }}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-6 rounded text-lg transition-colors">
                  🔄 NEW GAME
                </button>
                <button onClick={() => { setIsPaused(false); setGameState('menu'); }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded text-lg transition-colors">
                  🚪 QUIT TO MENU
                </button>
              </div>
              <p className="mt-4 text-center text-gray-400 text-sm">
                Day {day} · Score: {score} · Safety: {humanitySafety}% · Press ESC
              </p>
            </div>
          </div>
        )}

        {/* Day-change banner */}
        {processedToday === 0 && day > 1 && day <= 8 && !feedback && (
          <div className="bg-yellow-900 border-2 border-yellow-500 p-3 rounded-lg mb-4 animate-pulse">
            <div className="text-lg font-bold text-yellow-300">⚡ NEW PROTOCOL — DAY {day}</div>
            <div className="text-yellow-200 text-sm">{getDayRules(day).title}</div>
          </div>
        )}
        {processedToday === 0 && day > 8 && !feedback && (
          <div className="bg-cyan-900 border-2 border-cyan-500 p-3 rounded-lg mb-4">
            <div className="text-lg font-bold text-cyan-300">📡 ENDLESS MODE — DAY {day}</div>
            <div className="text-cyan-200 text-sm">Random protocol combinations. Voice ID may be active. Stay sharp!</div>
          </div>
        )}

        {/* Feedback banner */}
        {feedback && (
          <div className={`border-2 p-4 rounded-lg mb-4 ${feedback.correct ? 'bg-green-900 border-green-500' : 'bg-red-900 border-red-500'}`}>
            <div className="flex items-center gap-2 mb-1">
              {feedback.correct ? <CheckCircle size={22} /> : <XCircle size={22} />}
              <span className="text-lg font-bold">{feedback.message}</span>
            </div>
            <p className="text-sm">{feedback.reason}</p>
          </div>
        )}

        {/* Three-column layout: portrait | transmission | sidebar */}
        <div className="grid grid-cols-12 gap-4">

          {/* Character portrait (3 cols) */}
          <div className="col-span-3 flex flex-col items-center">
            {currentCase && !feedback && (
              <CharacterPortrait
                character={getCharacter(currentCase.from)}
                characterName={currentCase.from}
                claimedSpecies={currentCase.species}
                actualVoice={currentCase.voiceType}
                isSpeaking={isSpeaking}
                dialogueLine={currentCase.dialogueLine}
                showVoiceID={voiceIDActive}
              />
            )}
            {currentCase && (
              <div className="mt-2 text-center text-gray-500 text-xs">
                Transmissions today: {processedToday}/3
              </div>
            )}
          </div>

          {/* Main transmission panel (6 cols) */}
          <div className="col-span-6">
            {renderCase()}
          </div>

          {/* Protocol sidebar (3 cols) */}
          <div className="col-span-3">
            <div className="bg-gray-800 border-2 border-blue-500 p-4 rounded-lg sticky top-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={18} className="text-blue-400" />
                <h3 className="text-base font-bold text-blue-400">PROTOCOLS</h3>
              </div>
              <div className="text-xs text-yellow-400 mb-3">{currentDayRules.title}</div>

              <div className="space-y-2 text-xs max-h-[55vh] overflow-y-auto pr-1">
                {currentDayRules.rules.map((rule, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedInfo(rule.id)}
                    className="w-full text-left flex gap-2 p-2.5 rounded transition-all group
                      bg-gradient-to-b from-gray-700 to-gray-800 border-2 border-gray-600
                      shadow-[0_3px_0_0_rgba(75,85,99,1)]
                      hover:from-blue-700 hover:to-blue-800 hover:border-blue-500
                      hover:shadow-[0_3px_0_0_rgba(59,130,246,1)]
                      active:translate-y-[2px] active:shadow-[0_1px_0_0_rgba(59,130,246,1)]"
                  >
                    <span className="text-blue-400 flex-shrink-0 group-hover:text-blue-200">▸</span>
                    <span className="text-gray-200 group-hover:text-white flex-1">{rule.text}</span>
                    <span className="opacity-50 group-hover:opacity-100 transition-opacity">ℹ️</span>
                  </button>
                ))}
              </div>

              <div className="mt-3 bg-blue-950 border-2 border-blue-700 p-2.5 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-pulse">💡</span>
                  <div>
                    <div className="text-yellow-300 font-bold text-xs">TIP</div>
                    <div className="text-blue-200 text-xs">Click any rule for detailed info!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Protocol info panel */}
        {selectedInfo && PROTOCOL_INFO[selectedInfo] && (
          <div className="mt-4 bg-gray-800 border-2 border-purple-500 p-5 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-purple-400">📚 {PROTOCOL_INFO[selectedInfo].title}</h3>
              <button onClick={() => setSelectedInfo(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            <p className="text-gray-300 text-sm mb-3">{PROTOCOL_INFO[selectedInfo].description}</p>
            <div className="bg-gray-900 p-4 rounded border border-purple-700">
              <h4 className="text-purple-300 font-bold text-sm mb-2">What to Look For:</h4>
              <ul className="space-y-1.5 text-sm text-gray-300">
                {PROTOCOL_INFO[selectedInfo].whatToLookFor.map((item, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-purple-400 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

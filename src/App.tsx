import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, BookOpen, Radio, Volume2, VolumeX } from 'lucide-react';
import { useGameAudio } from './useGameAudio';

// Types
interface TransmissionCase {
  day: number;
  type: string;
  from: string;
  to: string;
  species: string;
  content: string;
  dnaSig: string;
  authCode: string;
  category: string;
  encryption: string;
  sourceIP: string;
  port: string;
  packetHash: string;
  employeeID: string;
  sslExpiry: string;
  correctAction: string;
  reason: string;
}

interface Feedback {
  correct: boolean;
  message: string;
  reason: string;
  action: string;
}

interface Rule {
  id: string;
  text: string;
}

interface DayRules {
  title: string;
  activeChecks: string[];
  rules: Rule[];
}

type RulesType = {
  [key: number]: DayRules;
};

const CyberInspector = () => {
  const audio = useGameAudio();
  const [gameState, setGameState] = useState('menu');
  const [day, setDay] = useState(1);
  const [score, setScore] = useState(0);
  const [humanitySafety, setHumanitySafety] = useState(100);
  const [timer, setTimer] = useState(90);
  const [currentCase, setCurrentCase] = useState<TransmissionCase | null>(null);
  const [processedToday, setProcessedToday] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [safetyShake, setSafetyShake] = useState(false);
  const [safetyGlow, setSafetyGlow] = useState<'green' | 'red' | null>(null);
  const [highestDay, setHighestDay] = useState(1);
  const [highestScore, setHighestScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Load high scores on mount
  useEffect(() => {
    const loadHighScores = () => {
      try {
        const dayValue = localStorage.getItem('highestDay');
        const scoreValue = localStorage.getItem('highestScore');
        if (dayValue) setHighestDay(parseInt(dayValue) || 1);
        if (scoreValue) setHighestScore(parseInt(scoreValue) || 0);
      } catch (error) {
        // High scores don't exist yet, that's fine
      }
    };
    loadHighScores();
  }, []);

  // Manage music based on game state
  useEffect(() => {
    if (gameState === 'menu') {
      audio.playMusic('menuMusic');
    } else if (gameState === 'ended') {
      audio.stopMusic();
    }
  }, [gameState]);

  const rules: RulesType = {
    1: {
      title: "Basic Protocol - Day 1",
      activeChecks: ['species', 'dna', 'authCode'],
      rules: [
        { id: 'species', text: "Block all transmissions from the Zorgon Empire (hostile species)" },
        { id: 'dna', text: "Block any data packets containing shapeshifter DNA signatures" },
        { id: 'species', text: "Allow transmissions from Allied Species: Andromedans, Pleiadians" },
        { id: 'authCode', text: "All transmissions must have valid authorization codes (format: EDF-XXXX)" }
      ]
    },
    2: {
      title: "Network Security - Day 2",
      activeChecks: ['species', 'dna', 'encryption', 'ip'],
      rules: [
        { id: 'species', text: "Block all transmissions from the Zorgon Empire (hostile species)" },
        { id: 'dna', text: "Block any data packets containing shapeshifter DNA signatures" },
        { id: 'encryption', text: "Military/Research require Level 5 encryption, Civilian requires Level 3+" },
        { id: 'ip', text: "Verify IP addresses match approved ranges for each species" },
        { id: 'ip', text: "Block hostile subnet: 66.6.x.x" }
      ]
    },
    3: {
      title: "Port Security - Day 3",
      activeChecks: ['species', 'dna', 'authCode', 'port'],
      rules: [
        { id: 'species', text: "Block all transmissions from the Zorgon Empire (hostile species)" },
        { id: 'dna', text: "Block any data packets containing shapeshifter DNA signatures" },
        { id: 'authCode', text: "All transmissions must have valid authorization codes (format: EDF-XXXX)" },
        { id: 'port', text: "Military: ports 443/22 only. Research: 443/22/8443. Civilian: 80/443/8080" },
        { id: 'port', text: "Block suspicious ports: 1337, 31337, 4444, 5555, 23 (Telnet)" }
      ]
    },
    4: {
      title: "Cryptographic Validation - Day 4",
      activeChecks: ['species', 'dna', 'hash', 'employeeID'],
      rules: [
        { id: 'species', text: "Block all transmissions from the Zorgon Empire (hostile species)" },
        { id: 'dna', text: "Block any data packets containing shapeshifter DNA signatures" },
        { id: 'hash', text: "Verify packet hash (64 hex chars). Block 'HASH_MISMATCH' or invalid formats" },
        { id: 'employeeID', text: "Verify employee IDs against registered personnel database" }
      ]
    },
    5: {
      title: "Certificate Security - Day 5",
      activeChecks: ['species', 'dna', 'ssl', 'ip'],
      rules: [
        { id: 'species', text: "Block all transmissions from the Zorgon Empire (hostile species)" },
        { id: 'dna', text: "Block any data packets containing shapeshifter DNA signatures" },
        { id: 'ssl', text: "Current date: 2087-06-15. Block expired or expiring-soon certificates (within 7 days)" },
        { id: 'ip', text: "Verify IP addresses match approved ranges. Block hostile subnet: 66.6.x.x" }
      ]
    },
    6: {
      title: "Full Security Audit - Day 6",
      activeChecks: ['species', 'dna', 'authCode', 'encryption', 'port'],
      rules: [
        { id: 'species', text: "Block all transmissions from the Zorgon Empire (hostile species)" },
        { id: 'dna', text: "Block any data packets containing shapeshifter DNA signatures" },
        { id: 'authCode', text: "All transmissions must have valid authorization codes (format: EDF-XXXX)" },
        { id: 'encryption', text: "Military/Research: Level 5 encryption. Civilian: Level 3+" },
        { id: 'port', text: "Verify ports match transmission category. Block suspicious ports" }
      ]
    },
    7: {
      title: "Advanced Threat Detection - Day 7",
      activeChecks: ['species', 'dna', 'ip', 'hash', 'employeeID'],
      rules: [
        { id: 'species', text: "Block all transmissions from the Zorgon Empire (hostile species)" },
        { id: 'dna', text: "Block any data packets containing shapeshifter DNA signatures" },
        { id: 'hash', text: "Verify packet hash integrity. Block 'HASH_MISMATCH' or invalid formats" },
        { id: 'employeeID', text: "Validate employee IDs against registered database" },
        { id: 'ip', text: "Block hostile subnet 66.6.x.x. Verify Allied IP ranges" }
      ]
    }
  };

  // Random data pools
  const senderNames: { [key: string]: string[] } = {
    Human: ["Commander Harris", "Dr. Chen", "Captain Rodriguez", "Officer Kim", "General Morrison", "Lieutenant Torres", "Pilot Jackson"],
    Andromedan: ["Ambassador Thel'nar", "Science Officer Tel'var", "Fleet Admiral Zyx", "Diplomat Kel'ran", "Commander Vel'nar"],
    Pleiadian: ["Fleet Admiral Zyx", "Medical Officer Var'nel", "Pilot Var'nel", "Ambassador Kyr'el", "Engineer Tal'os"],
    Zorgon: ["Warlord Xar'goth", "Commander Grath'nak", "Admiral Vor'ath", "General Kra'zor"]
  };

  const destinations = ["Lunar Base Alpha", "Mars Colony", "Saturn Outpost", "Earth Defense HQ", "Research Station", 
    "UN Headquarters", "Fleet Command", "Hospital Ship", "Command Center", "Flight Control"];

  const messageContent = [
    "Sending supply manifest for next week's shipment.",
    "Lab results attached for review.",
    "Status update on current operations.",
    "Tactical deployment orders included.",
    "Research data transmission in progress.",
    "Requesting docking clearance at station.",
    "Mission complete, returning to base.",
    "Patient transfer request - urgent.",
    "Patrol route updated per command.",
    "Ready for departure on your authorization."
  ];

  const contextualMessages: { [key: string]: string[] } = {
    authCode: [
      "Authorization code attached for verification.",
      "Transmitting with proper clearance codes.",
      "Security authorization included."
    ],
    encryption: [
      "Encrypted transmission - verify security level.",
      "Data protected with standard encryption.",
      "Classified information - check encryption requirements."
    ],
    ip: [
      "Transmitting from registered network.",
      "Connection established from secure location.",
      "Network origin: classified sector."
    ],
    port: [
      "Using standard communication protocol.",
      "Secure channel established.",
      "Data transfer via designated port."
    ],
    hash: [
      "Transmission integrity verified via cryptographic hash.",
      "Data fingerprint included for validation.",
      "Packet integrity check attached."
    ],
    employeeID: [
      "Personnel credentials attached.",
      "Authorized by registered staff member.",
      "Employee verification required."
    ],
    ssl: [
      "Secure certificate authentication active.",
      "Encrypted channel with valid certificate.",
      "TLS handshake completed - verify certificate status."
    ]
  };

  const validEmployeeIDs: { [key: string]: string[] } = {
    Human: ["H-29481", "H-84721", "H-19203", "H-55847"],
    Andromedan: ["A-73829", "A-29481", "A-10293"],
    Pleiadian: ["P-11203", "P-93847", "P-20194"]
  };

  const protocolInfo: { [key: string]: { title: string; description: string; whatToLookFor: string[] } } = {
    authCode: {
      title: "Authorization Codes",
      description: "Authorization codes are unique identifiers that verify a transmission is legitimate and approved by command.",
      whatToLookFor: [
        "Format must be exactly: EDF-XXXX (where X is a digit 0-9)",
        "Example valid codes: EDF-1234, EDF-9876, EDF-0042",
        "Invalid: PDF-1234 (wrong prefix), EDF-ABCD (letters instead of numbers), blank/missing",
        "Real-world equivalent: API keys, access tokens, security clearance codes"
      ]
    },
    encryption: {
      title: "Encryption Levels",
      description: "Encryption scrambles data so only authorized recipients can read it. Different security levels protect different types of information.",
      whatToLookFor: [
        "Military transmissions: Require Level 5 (highest security)",
        "Research transmissions: Require Level 5 (classified data)",
        "Civilian transmissions: Level 3 or higher is acceptable",
        "Real-world equivalent: SSL/TLS encryption, end-to-end encryption in messaging apps"
      ]
    },
    ip: {
      title: "IP Address Validation",
      description: "IP addresses identify where network traffic comes from. Checking IPs helps detect spoofing and unauthorized access attempts.",
      whatToLookFor: [
        "Earth approved ranges: 10.x.x.x, 172.16-31.x.x, 192.168.x.x",
        "Andromedan range: 203.x.x.x",
        "Pleiadian range: 198.x.x.x",
        "Hostile subnet: 66.6.x.x (always block)",
        "Real-world equivalent: IP whitelisting, geolocation filtering, firewall rules"
      ]
    },
    port: {
      title: "Port/Protocol Security",
      description: "Ports are virtual channels for network communication. Certain ports are secure, while others are known vulnerabilities.",
      whatToLookFor: [
        "Secure ports: 443 (HTTPS), 22 (SSH), 8443 (Alt HTTPS)",
        "Legacy insecure: Port 23 (Telnet - unencrypted)",
        "Suspicious hacker ports: 1337, 31337, 4444, 5555",
        "Military must use 443 or 22 only",
        "Real-world equivalent: Firewall port filtering, closing unnecessary ports"
      ]
    },
    hash: {
      title: "Packet Hash Verification",
      description: "A cryptographic hash is a unique digital fingerprint of data. If data is modified, the hash changes, revealing tampering.",
      whatToLookFor: [
        "Valid hash: Exactly 64 hexadecimal characters (0-9, a-f)",
        "Example: a3f2b9c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
        "'HASH_MISMATCH' = data was altered/corrupted in transit (BLOCK)",
        "Too short or invalid characters = compromised integrity (BLOCK)",
        "Real-world equivalent: SHA-256 checksums, file integrity verification"
      ]
    },
    employeeID: {
      title: "Employee ID Authentication",
      description: "Employee IDs verify that personnel are registered and authorized to send transmissions. Unregistered IDs indicate impostors.",
      whatToLookFor: [
        "Valid Human IDs: H-29481, H-84721, H-19203, H-55847",
        "Valid Andromedan IDs: A-73829, A-29481, A-10293",
        "Valid Pleiadian IDs: P-11203, P-93847, P-20194",
        "Any ID not in the database = unauthorized access attempt",
        "Real-world equivalent: Employee badges, username databases, access control lists"
      ]
    },
    ssl: {
      title: "SSL Certificate Validation",
      description: "SSL certificates verify identity and enable encrypted connections. Expired or soon-to-expire certificates are security vulnerabilities.",
      whatToLookFor: [
        "Current date in game: 2087-06-15",
        "Block certificates that expired before today",
        "Block certificates expiring within 7 days (security policy)",
        "Example expired: 2087-06-08, Example expiring soon: 2087-06-20",
        "Real-world equivalent: HTTPS certificates, certificate pinning, expiration monitoring"
      ]
    },
    species: {
      title: "Species Verification",
      description: "Identifying the sender's species is the first line of defense. Hostile species must be blocked immediately.",
      whatToLookFor: [
        "Allied species: Humans, Andromedans, Pleiadians (generally ALLOW)",
        "Hostile species: Zorgons (always BLOCK)",
        "Cross-reference with other security checks for final decision",
        "Real-world equivalent: User authentication, identity verification systems"
      ]
    },
    dna: {
      title: "DNA Signature Analysis",
      description: "DNA signatures detect shapeshifters attempting to impersonate authorized personnel. This biological verification prevents infiltration.",
      whatToLookFor: [
        "Normal signatures: Human-Standard, Andromedan-Standard, Pleiadian-Standard",
        "'Shapeshifter-Detected' = impostor attempting infiltration (BLOCK)",
        "Always cross-check DNA with claimed species",
        "Real-world equivalent: Biometric authentication, facial recognition, fingerprint scanning"
      ]
    }
  };

  const generateTransmission = (currentDay: number): TransmissionCase => {
    const dayRules = rules[Math.min(currentDay, 7)];
    const activeChecks = dayRules.activeChecks;
    
    // Pick a random check to potentially violate
    const errorCheck = Math.random() < 0.5 ? null : activeChecks[Math.floor(Math.random() * activeChecks.length)];
    
    // Pick species (with chance of hostile Zorgon)
    const speciesOptions = errorCheck === 'species' ? ["Zorgon"] : ["Human", "Andromedan", "Pleiadian"];
    const species = speciesOptions[Math.floor(Math.random() * speciesOptions.length)];
    
    const from = senderNames[species][Math.floor(Math.random() * senderNames[species].length)];
    const to = destinations[Math.floor(Math.random() * destinations.length)];
    
    // Generate contextual message based on active checks
    let content = messageContent[Math.floor(Math.random() * messageContent.length)];
    // Add a contextual hint based on a random active check
    const randomCheck = activeChecks[Math.floor(Math.random() * activeChecks.length)];
    if (contextualMessages[randomCheck]) {
      const contextHint = contextualMessages[randomCheck][Math.floor(Math.random() * contextualMessages[randomCheck].length)];
      content = content + " " + contextHint;
    }
    
    // DNA Signature
    const dnaSig = (errorCheck === 'dna' && species !== "Zorgon") 
      ? "Shapeshifter-Detected" 
      : `${species}-Standard`;
    
    // Authorization code
    let authCode = "";
    if (activeChecks.includes('authCode')) {
      if (errorCheck === 'authCode') {
        const formats = ["PDF-" + Math.floor(Math.random() * 10000), "EDF-ABCD", ""];
        authCode = formats[Math.floor(Math.random() * formats.length)];
      } else {
        authCode = "EDF-" + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      }
    }
    
    // Category and Encryption
    let category = "";
    let encryption = "";
    if (activeChecks.includes('encryption')) {
      const categories = ["Military", "Research", "Civilian"];
      category = categories[Math.floor(Math.random() * categories.length)];
      
      if (errorCheck === 'encryption' && (category === "Military" || category === "Research")) {
        encryption = "Level " + (Math.floor(Math.random() * 2) + 3);
      } else if (category === "Military" || category === "Research") {
        encryption = "Level 5";
      } else {
        encryption = "Level " + (Math.floor(Math.random() * 3) + 3);
      }
    }
    
    // IP Address
    let sourceIP = "";
    if (activeChecks.includes('ip')) {
      if (errorCheck === 'ip') {
        sourceIP = "66.6." + Math.floor(Math.random() * 256) + "." + Math.floor(Math.random() * 256);
      } else {
        if (species === "Human") {
          const ranges = ["10.", "172.", "192.168."];
          const range = ranges[Math.floor(Math.random() * ranges.length)];
          if (range === "10.") {
            sourceIP = range + Math.floor(Math.random() * 256) + "." + Math.floor(Math.random() * 256) + "." + Math.floor(Math.random() * 256);
          } else if (range === "172.") {
            sourceIP = range + (16 + Math.floor(Math.random() * 16)) + "." + Math.floor(Math.random() * 256) + "." + Math.floor(Math.random() * 256);
          } else {
            sourceIP = range + Math.floor(Math.random() * 256) + "." + Math.floor(Math.random() * 256);
          }
        } else if (species === "Andromedan") {
          sourceIP = "203." + Math.floor(Math.random() * 256) + "." + Math.floor(Math.random() * 256) + "." + Math.floor(Math.random() * 256);
        } else if (species === "Pleiadian") {
          sourceIP = "198." + Math.floor(Math.random() * 256) + "." + Math.floor(Math.random() * 256) + "." + Math.floor(Math.random() * 256);
        } else {
          sourceIP = "66.6." + Math.floor(Math.random() * 256) + "." + Math.floor(Math.random() * 256);
        }
      }
    }
    
    // Port/Protocol
    let port = "";
    if (activeChecks.includes('port')) {
      if (errorCheck === 'port') {
        if (category === "Military" || category === "Research") {
          const badPorts = ["80", "8080", "23", "1337"];
          port = badPorts[Math.floor(Math.random() * badPorts.length)];
        } else {
          const suspiciousPorts = ["1337", "31337", "4444", "5555", "23"];
          port = suspiciousPorts[Math.floor(Math.random() * suspiciousPorts.length)];
        }
      } else {
        if (category === "Military") {
          port = ["443", "22"][Math.floor(Math.random() * 2)];
        } else if (category === "Research") {
          port = ["443", "22", "8443"][Math.floor(Math.random() * 3)];
        } else {
          port = ["80", "443", "8080"][Math.floor(Math.random() * 3)];
        }
      }
    }
    
    // Packet Hash
    let packetHash = "";
    if (activeChecks.includes('hash')) {
      if (errorCheck === 'hash') {
        const invalidHashes = ["HASH_MISMATCH", "a1b2c3d4e5f6", "ZZZZ"];
        packetHash = invalidHashes[Math.floor(Math.random() * invalidHashes.length)];
      } else {
        const hexChars = "0123456789abcdef";
        packetHash = Array.from({length: 64}, () => hexChars[Math.floor(Math.random() * 16)]).join('');
      }
    }
    
    // Employee ID
    let employeeID = "";
    if (activeChecks.includes('employeeID') && species !== "Zorgon") {
      if (errorCheck === 'employeeID') {
        const prefix = species === "Human" ? "H-" : species === "Andromedan" ? "A-" : "P-";
        employeeID = prefix + Math.floor(Math.random() * 90000 + 10000);
      } else {
        employeeID = validEmployeeIDs[species][Math.floor(Math.random() * validEmployeeIDs[species].length)];
      }
    }
    
    // SSL Certificate
    let sslExpiry = "";
    if (activeChecks.includes('ssl')) {
      if (errorCheck === 'ssl') {
        const badDates = ["2087-06-10", "2087-06-08", "2087-05-20"];
        sslExpiry = badDates[Math.floor(Math.random() * badDates.length)];
      } else {
        const validDates = ["2088-01-15", "2087-12-20", "2087-09-30", "2087-08-10"];
        sslExpiry = validDates[Math.floor(Math.random() * validDates.length)];
      }
    }
    
    // Determine correct action and reason
    let correctAction = "allow";
    let reason = "All protocols check out - legitimate transmission";
    
    if (species === "Zorgon") {
      correctAction = "block";
      reason = "Hostile Zorgon species detected";
    } else if (dnaSig === "Shapeshifter-Detected") {
      correctAction = "block";
      reason = "Shapeshifter DNA signature detected";
    } else if (activeChecks.includes('authCode') && (!authCode || !authCode.match(/^EDF-\d{4}$/))) {
      correctAction = "block";
      reason = authCode ? "Invalid authorization code format" : "Missing authorization code";
    } else if (activeChecks.includes('encryption') && (category === "Military" || category === "Research") && encryption !== "Level 5") {
      correctAction = "block";
      reason = `${category} transmission requires Level 5 encryption`;
    } else if (activeChecks.includes('ip') && sourceIP.startsWith("66.6.")) {
      correctAction = "block";
      reason = "Source IP from known hostile subnet (66.6.x.x)";
    } else if (activeChecks.includes('port')) {
      const suspiciousPorts = ["1337", "31337", "4444", "5555", "23"];
      if (suspiciousPorts.includes(port)) {
        correctAction = "block";
        reason = `Suspicious port detected: ${port}`;
      } else if ((category === "Military") && !["443", "22"].includes(port)) {
        correctAction = "block";
        reason = `Military transmission must use secure ports (443, 22)`;
      } else if ((category === "Research") && !["443", "22", "8443"].includes(port)) {
        correctAction = "block";
        reason = `Research transmission must use secure ports (443, 22, 8443)`;
      }
    } else if (activeChecks.includes('hash')) {
      if (packetHash === "HASH_MISMATCH") {
        correctAction = "block";
        reason = "Packet hash mismatch - transmission may be tampered";
      } else if (packetHash.length !== 64 || !/^[0-9a-f]+$/.test(packetHash)) {
        correctAction = "block";
        reason = "Invalid packet hash format";
      }
    } else if (activeChecks.includes('employeeID') && employeeID && !validEmployeeIDs[species].includes(employeeID)) {
      correctAction = "block";
      reason = "Employee ID not found in registered database";
    } else if (activeChecks.includes('ssl') && sslExpiry) {
      const expiryDate = new Date(sslExpiry);
      const currentDate = new Date("2087-06-15");
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry < 0) {
        correctAction = "block";
        reason = "SSL certificate expired on " + sslExpiry;
      } else if (daysUntilExpiry < 7) {
        correctAction = "block";
        reason = "SSL certificate expires within 7 days";
      }
    }
    
    return {
      day: currentDay,
      type: "Transmission",
      from,
      to,
      species,
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
      correctAction,
      reason
    };
  };

  useEffect(() => {
    if (gameState === 'playing' && timer > 0 && !isPaused) {
      const interval = setInterval(() => {
        setTimer((t: number) => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && gameState === 'playing') {
      endDay();
    }
  }, [timer, gameState, isPaused]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState === 'playing' && e.key === 'Escape') {
        setIsPaused(p => !p);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  const startGame = () => {
    setGameState('playing');
    setDay(1);
    setScore(0);
    setHumanitySafety(100);
    setProcessedToday(0);
    setIsPaused(false);
    loadNextCase();
    setTimer(90);
    audio.playMusic('bgMusic');
  };

  const loadNextCase = () => {
    const newCase = generateTransmission(day);
    setCurrentCase(newCase);
  };

  const handleDecision = (action: string) => {
    if (!currentCase) return;

    // Play button click sound
    if (action === 'allow') {
      audio.playSound('approve');
    } else {
      audio.playSound('deny');
    }

    const correct = action === currentCase.correctAction;
    const points = correct ? 15 : -15;
    const safetyChange = correct ? 5 : -20; // Much harsher penalty for wrong answers

    setScore((s: number) => s + points);
    setHumanitySafety((r: number) => Math.max(0, Math.min(100, r + safetyChange)));
    setProcessedToday((p: number) => p + 1);

    // Trigger visual effects
    if (correct) {
      setSafetyGlow('green');
      audio.playSound('correct');
      setTimeout(() => setSafetyGlow(null), 1000);
    } else {
      setSafetyShake(true);
      setSafetyGlow('red');
      audio.playSound('wrong');
      setTimeout(() => {
        setSafetyShake(false);
        setSafetyGlow(null);
      }, 1000);
    }

    setFeedback({
      correct,
      message: correct ? "✓ Correct Assessment!" : "✗ Critical Error!",
      reason: currentCase.reason,
      action
    });

    setTimeout(() => {
      setFeedback(null);
      if (processedToday >= 2) {
        endDay();
      } else {
        loadNextCase();
      }
    }, 3000);
  };

  const endDay = () => {
    if (humanitySafety <= 0) {
      // Update high scores
      updateHighScores();
      audio.stopMusic();
      audio.playSound('gameOver');
      setGameState('ended');
    } else {
      audio.playSound('dayChange');
      setDay((d: number) => d + 1);
      setProcessedToday(0);
      setTimer(90);
      setTimeout(() => {
        loadNextCase();
      }, 100);
    }
  };

  const updateHighScores = () => {
    // Update highest day
    if (day > highestDay) {
      setHighestDay(day);
      try {
        localStorage.setItem('highestDay', day.toString());
      } catch (error) {
        console.error('Failed to save highest day:', error);
      }
    }
    
    // Update highest score
    if (score > highestScore) {
      setHighestScore(score);
      try {
        localStorage.setItem('highestScore', score.toString());
      } catch (error) {
        console.error('Failed to save highest score:', error);
      }
    }
  };

  const renderCase = () => {
    if (!currentCase) return null;

    const activeChecks = rules[Math.min(day, 7)].activeChecks;

    return (
      <div className="bg-gray-800 border-2 border-cyan-500 p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-cyan-400">{currentCase.type}</h3>
          {day === 1 && (
            <span className="px-3 py-1 rounded font-bold bg-blue-900 text-blue-200">
              ℹ TRAINING MODE
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Left Column - Basic Info */}
          <div className="space-y-2 text-gray-300 font-mono text-sm bg-gray-900 p-4 rounded border border-cyan-700">
            <div className="text-cyan-300 font-bold mb-2">TRANSMISSION DATA</div>
            <div><span className="text-cyan-400">FROM:</span> {currentCase.from}</div>
            <div><span className="text-cyan-400">TO:</span> {currentCase.to}</div>
            <div><span className="text-cyan-400">SPECIES:</span> {currentCase.species}</div>
            <div><span className="text-cyan-400">DNA SIG:</span> {currentCase.dnaSig}</div>
          </div>

          {/* Right Column - Security Checks */}
          <div className="space-y-2 text-gray-300 font-mono text-sm bg-gray-900 p-4 rounded border border-yellow-600">
            <div className="text-yellow-300 font-bold mb-2">SECURITY CHECKS</div>
            
            {activeChecks.includes('authCode') && currentCase.authCode !== undefined && (
              <div className="mb-2">
                <span className="text-yellow-400">AUTH CODE:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${currentCase.authCode ? 'bg-gray-700' : 'bg-red-900'}`}>
                  {currentCase.authCode || 'MISSING'}
                </span>
              </div>
            )}
            
            {activeChecks.includes('encryption') && currentCase.encryption && (
              <div className="mb-2">
                <span className="text-yellow-400">CATEGORY:</span> {currentCase.category}
                <br />
                <span className="text-yellow-400">ENCRYPTION:</span> 
                <span className="ml-2 px-2 py-1 rounded bg-gray-700 text-xs">
                  {currentCase.encryption}
                </span>
              </div>
            )}

            {activeChecks.includes('ip') && currentCase.sourceIP && (
              <div className="mb-2">
                <span className="text-yellow-400">SOURCE IP:</span> 
                <span className="ml-2 px-2 py-1 rounded bg-gray-700 text-xs">
                  {currentCase.sourceIP}
                </span>
              </div>
            )}

            {activeChecks.includes('port') && currentCase.port && (
              <div className="mb-2">
                <span className="text-yellow-400">PORT:</span> 
                <span className="ml-2 px-2 py-1 rounded bg-gray-700 text-xs">
                  {currentCase.port}
                </span>
              </div>
            )}

            {activeChecks.includes('hash') && currentCase.packetHash && (
              <div className="mb-2">
                <span className="text-yellow-400">PKT HASH:</span> 
                <span className="ml-2 px-1 py-1 rounded bg-gray-700 text-xs break-all">
                  {currentCase.packetHash}
                </span>
              </div>
            )}

            {activeChecks.includes('employeeID') && currentCase.employeeID && (
              <div className="mb-2">
                <span className="text-yellow-400">EMPLOYEE ID:</span> 
                <span className="ml-2 px-2 py-1 rounded bg-gray-700 text-xs">
                  {currentCase.employeeID}
                </span>
              </div>
            )}

            {activeChecks.includes('ssl') && currentCase.sslExpiry && (
              <div className="mb-2">
                <span className="text-yellow-400">SSL EXPIRY:</span> 
                <span className="ml-2 px-2 py-1 rounded bg-gray-700 text-xs">
                  {currentCase.sslExpiry}
                </span>
                <div className="text-xs text-gray-500 mt-1">Today: 2087-06-15</div>
              </div>
            )}

            {/* Show friendly note if no extra checks needed */}
            {!activeChecks.some((check: string) => ['authCode', 'encryption', 'ip', 'port', 'hash', 'employeeID', 'ssl'].includes(check)) && (
              <div className="text-gray-400 text-xs italic">
                No additional security fields required today.
              </div>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="mt-3 p-3 bg-gray-900 rounded border border-cyan-700">
          <div className="text-cyan-300 text-xs mb-1">MESSAGE CONTENT:</div>
          <div className="text-gray-400 text-sm">{currentCase.content}</div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => handleDecision('allow')}
            className="flex-1 bg-green-600 hover:bg-green-500 hover:shadow-lg hover:shadow-green-500/50 active:scale-95 active:bg-green-700 text-white font-bold py-4 px-6 rounded flex items-center justify-center gap-2 transition-all duration-150 text-lg border-2 border-green-400 hover:border-green-300"
          >
            <CheckCircle size={24} />
            APPROVE
          </button>
          <button
            onClick={() => handleDecision('block')}
            className="flex-1 bg-red-600 hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/50 active:scale-95 active:bg-red-700 text-white font-bold py-4 px-6 rounded flex items-center justify-center gap-2 transition-all duration-150 text-lg border-2 border-red-400 hover:border-red-300"
          >
            <XCircle size={24} />
            DENY
          </button>
        </div>
      </div>
    );
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 text-cyan-400 p-8 font-mono">
        <div className="max-w-2xl mx-auto text-center">
          <Radio size={80} className="mx-auto mb-6 text-cyan-500 animate-pulse" />
          <h1 className="text-5xl font-bold mb-4 text-cyan-300">EARTH DEFENSE NET</h1>
          <p className="text-xl mb-8 text-gray-400">Transmission Control Officer</p>
          <div className="bg-gray-800 border-2 border-cyan-500 p-6 rounded-lg mb-8 text-left">
            <p className="mb-4">⚠ PRIORITY ALERT: Alien invasion detected. Multiple hostile species attempting to breach Earth's defense network.</p>
            <p className="mb-4">Your mission: Monitor all incoming transmissions. Each day brings different security protocols to master:</p>
            <ul className="text-sm mb-4 ml-4 space-y-1">
              <li>🛡️ Species & DNA verification</li>
              <li>🔐 Authorization codes</li>
              <li>🔒 Encryption validation</li>
              <li>🌐 IP address filtering</li>
              <li>🔌 Port security</li>
              <li>🔗 Packet integrity checks</li>
              <li>👤 Employee authentication</li>
              <li>📜 SSL certificates</li>
            </ul>
            <p className="mb-4 text-yellow-400">⚡ Protocols rotate daily - stay sharp and adapt!</p>
            <p className="mb-4 text-purple-400">💡 Click on any protocol during the game to learn what it means and what to look for!</p>
            <p className="text-red-400">⚠ If Earth's safety drops to 0%, humanity falls.</p>
          </div>
          <button
            onClick={startGame}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 px-8 rounded text-xl transition-colors shadow-lg shadow-cyan-500/50"
          >
            BEGIN WATCH
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'ended') {
    const isNewDayRecord = day > highestDay;
    const isNewScoreRecord = score > highestScore;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 text-cyan-400 p-8 font-mono">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-red-400">
            <h1 className="text-4xl font-bold mb-4">
              ✗ DEFENSE GRID FAILED
            </h1>
          </div>
          <div className="bg-gray-800 border-2 border-cyan-500 p-6 rounded-lg mb-8">
            <div className="text-2xl mb-4">Mission Report</div>
            <div className="space-y-2 text-xl">
              <div>Days Survived: {day} {isNewDayRecord && <span className="text-yellow-400">🏆 NEW RECORD!</span>}</div>
              <div>Final Score: {score} {isNewScoreRecord && <span className="text-yellow-400">⭐ NEW RECORD!</span>}</div>
              <div>Earth Safety: {humanitySafety}%</div>
            </div>
            {day >= 15 && (
              <p className="mt-4 text-yellow-400 font-bold">
                🏆 LEGENDARY DEFENDER<br/>You survived {day} days of endless invasions!
              </p>
            )}
            {day >= 10 && day < 15 && (
              <p className="mt-4 text-green-400 font-bold">
                ⭐ MASTER ANALYST<br/>All protocols mastered! Survived {day} days.
              </p>
            )}
            {day >= 7 && day < 10 && (
              <p className="mt-4 text-green-400">
                ✓ Advanced protocols learned! Survived {day} days.
              </p>
            )}
            {day < 7 && (
              <p className="mt-4 text-red-400">
                Training incomplete. Hostile forces breached defenses on Day {day}.
              </p>
            )}
          </div>
          <button
            onClick={startGame}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 px-8 rounded text-xl transition-colors shadow-lg shadow-cyan-500/50"
          >
            RETRY MISSION
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 text-cyan-400 p-4 font-mono">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 border-2 border-cyan-500 p-4 rounded-lg mb-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Radio size={24} className="animate-pulse" />
              <span className="text-xl font-bold">DEFENSE NET</span>
            </div>
            <div className="px-3 py-1 bg-blue-900 rounded">DAY {day}</div>
            <div>SCORE: {score}</div>
            <div 
              className={`px-3 py-1 rounded font-bold transition-all duration-300 ${
                safetyShake ? 'animate-shake' : ''
              } ${
                safetyGlow === 'green' ? 'bg-green-600 text-white shadow-lg shadow-green-500/50' :
                safetyGlow === 'red' ? 'bg-red-600 text-white shadow-lg shadow-red-500/50' :
                humanitySafety < 30 ? 'bg-red-900 text-red-200 animate-pulse' :
                humanitySafety < 60 ? 'bg-yellow-900 text-yellow-200' :
                'bg-green-900 text-green-200'
              }`}
            >
              🌍 EARTH SAFETY: {humanitySafety}%
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-purple-950 border border-purple-700 px-3 py-1 rounded text-xs">
              <div className="text-purple-300">🏆 BEST DAY: {highestDay}</div>
              <div className="text-purple-300">⭐ BEST SCORE: {highestScore}</div>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={20} />
              <span className={timer < 20 ? 'text-red-400 animate-pulse' : ''}>{timer}s</span>
            </div>
            <button
              onClick={() => {
                const muted = audio.toggleMute();
                setIsMuted(muted);
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button
              onClick={() => setIsPaused(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <span className="text-lg">⏸</span>
              MENU
            </button>
          </div>
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          .animate-shake {
            animation: shake 0.5s;
          }
        `}</style>

        {/* Pause Menu Modal */}
        {isPaused && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-gray-800 border-2 border-cyan-500 p-8 rounded-lg max-w-md w-full">
              <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">⏸ GAME PAUSED</h2>
              <div className="space-y-4">
                <button
                  onClick={() => setIsPaused(false)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded text-lg transition-colors"
                >
                  ▶ RESUME GAME
                </button>
                <button
                  onClick={() => {
                    setIsPaused(false);
                    startGame();
                  }}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-6 rounded text-lg transition-colors"
                >
                  🔄 NEW GAME
                </button>
                <button
                  onClick={() => {
                    setIsPaused(false);
                    setGameState('menu');
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded text-lg transition-colors"
                >
                  🚪 QUIT TO MENU
                </button>
              </div>
              <div className="mt-6 text-center text-gray-400 text-sm">
                <div>Current Progress:</div>
                <div>Day {day} • Score: {score} • Safety: {humanitySafety}%</div>
                <div className="mt-2 text-xs text-gray-500">Press ESC to pause/resume</div>
              </div>
            </div>
          </div>
        )}

        {/* Day Change Notification */}
        {processedToday === 0 && day > 1 && day <= 7 && !feedback && (
          <div className="bg-yellow-900 border-2 border-yellow-500 p-4 rounded-lg mb-4 animate-pulse">
            <div className="text-xl font-bold text-yellow-300 mb-2">
              ⚡ NEW PROTOCOL ROTATION - DAY {day}
            </div>
            <div className="text-yellow-200">
              {rules[day].title} - Different security checks today!
            </div>
          </div>
        )}

        {processedToday === 0 && day > 7 && !feedback && (
          <div className="bg-cyan-900 border-2 border-cyan-500 p-4 rounded-lg mb-4">
            <div className="text-xl font-bold text-cyan-300 mb-2">
              📡 ENDLESS MODE - DAY {day}
            </div>
            <div className="text-cyan-200">
              Random protocol combinations. Stay vigilant!
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`border-2 p-4 rounded-lg mb-4 ${feedback.correct ? 'bg-green-900 border-green-500' : 'bg-red-900 border-red-500'}`}>
            <div className="flex items-center gap-2 mb-2">
              {feedback.correct ? <CheckCircle size={24} /> : <XCircle size={24} />}
              <span className="text-xl font-bold">{feedback.message}</span>
            </div>
            <p className="text-sm">{feedback.reason}</p>
          </div>
        )}

        {/* Main Content: Two Column Layout */}
        <div className="grid grid-cols-3 gap-4">
          {/* Left Column - Transmission (2/3 width) */}
          <div className="col-span-2">
            {!feedback && renderCase()}
            
            {/* Progress */}
            <div className="mt-4 text-center text-gray-500 text-sm">
              Transmissions processed today: {processedToday}/3
            </div>
          </div>

          {/* Right Column - Protocols (1/3 width) */}
          <div className="col-span-1">
            <div className="bg-gray-800 border-2 border-blue-500 p-4 rounded-lg sticky top-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={20} className="text-blue-400" />
                <h3 className="text-lg font-bold text-blue-400">PROTOCOLS</h3>
              </div>
              <div className="text-xs text-yellow-400 mb-3">{rules[Math.min(day, 7)].title}</div>
              <div className="space-y-2 text-xs max-h-[70vh] overflow-y-auto pr-1">
                {rules[Math.min(day, 7)].rules.map((rule: Rule, idx: number) => (
                  <button 
                    key={idx} 
                    className="w-full text-left flex gap-2 cursor-pointer p-2.5 rounded transition-all
                      bg-gradient-to-b from-gray-700 to-gray-800
                      border-2 border-gray-600
                      shadow-[0_3px_0_0_rgba(75,85,99,1),0_4px_6px_-1px_rgba(0,0,0,0.3)]
                      hover:from-blue-700 hover:to-blue-800 hover:border-blue-500
                      hover:shadow-[0_3px_0_0_rgba(59,130,246,1),0_4px_6px_-1px_rgba(59,130,246,0.5)]
                      active:shadow-[0_1px_0_0_rgba(59,130,246,1)]
                      active:translate-y-[2px]
                      group"
                    onClick={() => setSelectedInfo(rule.id)}
                  >
                    <span className="text-blue-400 flex-shrink-0 group-hover:text-blue-200">▸</span>
                    <span className="text-gray-200 group-hover:text-white flex-1">{rule.text}</span>
                    <span className="text-blue-400 opacity-50 group-hover:opacity-100 transition-opacity text-base">ℹ️</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 text-xs border-t border-gray-700 pt-3">
                <div className="bg-blue-950 border-2 border-blue-700 p-3 rounded-lg shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl animate-pulse">💡</span>
                    <div>
                      <div className="text-yellow-300 font-bold">HINT</div>
                      <div className="text-blue-200 text-xs">Click any protocol above for detailed cybersecurity information!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Panel */}
        {selectedInfo && protocolInfo[selectedInfo] && (
          <div className="mt-4 bg-gray-800 border-2 border-purple-500 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-purple-400">📚 {protocolInfo[selectedInfo].title}</h3>
              <button 
                onClick={() => setSelectedInfo(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-300 mb-4">{protocolInfo[selectedInfo].description}</p>
            <div className="bg-gray-900 p-4 rounded border border-purple-700">
              <h4 className="text-purple-300 font-bold mb-2">What to Look For:</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                {protocolInfo[selectedInfo].whatToLookFor.map((item: string, idx: number) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-purple-400">•</span>
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
};

export default CyberInspector;
// The Phantom Legion. Every enemy is a real identity attack in costume,
// and every codex entry is the real-world briefing earned by defeating it.
//
// mechanics flags:
//   phish      — its big attack is phishing: auto-fails once Hiro has the Passkey Blade
//   deepfake   — untargetable until revealed with Affirm Mirror
//   pushbomb   — periodically traps the player in an APPROVE?/DENY prompt
//   steal      — tries to steal an item; blocked by Enterprise Passkey Armor
//   drainTp    — social engineering chips away Trust Points
//   multi      — weak rapid multi-hit (credential spray)
//   boss       — boss framing, no flee

export const ENEMIES = {
  phishkoi: {
    name: 'PHISH KOI', art: 'phishkoi', hp: 14, atk: 6, def: 1, xp: 7, gold: 5,
    mechanics: ['phish'],
    attacks: [
      { name: 'HOOK CAST', type: 'phish', mult: 1.4 },
      { name: 'SPLASH', type: 'hit', mult: 0.8 },
    ],
    codex: {
      title: 'PHISHING',
      threat: 'FAKE EMAILS AND PAGES LURE USERS INTO TYPING THEIR PASSWORDS.',
      stat: 'AI-WRITTEN PHISHING LURES SURGED 1,265% AFTER GEN-AI ARRIVED.',
      answer: 'HYPR AUTHENTICATE USES FIDO2 PASSKEYS. THERE IS NO PASSWORD TO TYPE, SO THE HOOK CATCHES NOTHING.',
    },
  },
  spearphish: {
    name: 'SPEAR-PHISH', art: 'spearphish', hp: 18, atk: 8, def: 2, xp: 9, gold: 7,
    mechanics: ['phish'],
    attacks: [
      { name: 'TARGETED LURE', type: 'phish', mult: 1.6 },
      { name: 'FIN SLAP', type: 'hit', mult: 0.9 },
    ],
    codex: {
      title: 'SPEAR PHISHING',
      threat: 'A LURE CRAFTED FOR ONE SPECIFIC TARGET, USING THEIR NAME, BOSS AND PROJECTS.',
      stat: 'IMPERSONATION INCIDENTS ROSE 35% IN A SINGLE YEAR.',
      answer: 'PHISHING-RESISTANT MFA IS DETERMINISTIC. EVEN A PERFECT LURE FINDS NO SHARED SECRET TO STEAL.',
    },
  },
  angler: {
    name: 'LURE ANGLER', art: 'angler', hp: 22, atk: 9, def: 2, xp: 11, gold: 9,
    mechanics: ['phish'],
    attacks: [
      { name: 'FAKE LOGIN GLOW', type: 'phish', mult: 1.7 },
      { name: 'BITE', type: 'hit', mult: 1.0 },
    ],
    codex: {
      title: 'FAKE LOGIN PAGES',
      threat: 'PIXEL-PERFECT COPIES OF REAL LOGIN PAGES HARVEST CREDENTIALS IN THE DARK.',
      stat: 'MOST CREDENTIAL THEFT STARTS AT A PAGE THAT LOOKS EXACTLY RIGHT.',
      answer: 'PASSKEYS ARE BOUND TO THE REAL ORIGIN. ON A FAKE PAGE THE KEY SIMPLY WILL NOT FIRE.',
    },
  },
  lazarus: {
    name: 'LAZARUS MASK', art: 'lazarus', hp: 26, atk: 11, def: 3, xp: 13, gold: 11,
    mechanics: [],
    attacks: [
      { name: 'FAKE RESUME', type: 'hit', mult: 1.3 },
      { name: 'BORROWED FACE', type: 'drain', mult: 1.0 },
    ],
    codex: {
      title: 'CANDIDATE FRAUD',
      threat: 'FAKE WORKERS, SOME STATE-SPONSORED, INTERVIEW AND GET HIRED WITH STOLEN OR SYNTHETIC IDENTITIES.',
      stat: 'CANDIDATE FRAUD IS NOW THE 2ND MOST PREVALENT IDENTITY THREAT. ONE FAKE-WORKER RING COST $17M.',
      answer: 'HYPR AFFIRM VERIFIES DOCUMENTS, FACE AND LIVENESS AT ONBOARDING. KNOW YOUR EMPLOYEE FROM DAY ZERO.',
    },
  },
  doppel: {
    name: 'DEEPFAKE DOPPEL', art: 'doppel', hp: 30, atk: 12, def: 3, xp: 15, gold: 12,
    mechanics: ['deepfake'],
    attacks: [
      { name: 'MIMIC STRIKE', type: 'hit', mult: 1.3 },
      { name: 'SYNTHETIC SMILE', type: 'drain', mult: 1.1 },
    ],
    codex: {
      title: 'DEEPFAKES',
      threat: 'AI-GENERATED FACES AND VOICES IMPERSONATE REAL PEOPLE ON VIDEO CALLS AND PHONE LINES.',
      stat: '87% OF ORGANIZATIONS HAVE ALREADY MET A DEEPFAKE IN AN IDENTITY ATTACK.',
      answer: 'HYPR AFFIRM RUNS LIVENESS AND INJECTION-ATTACK DETECTION. A COPY CANNOT PASS A LIVE PRESENCE CHECK.',
    },
  },
  vishimp: {
    name: 'VISHING IMP', art: 'vishimp', hp: 32, atk: 14, def: 4, xp: 17, gold: 14,
    mechanics: ['drainTp'],
    attacks: [
      { name: 'URGENT CALL', type: 'drain', mult: 1.2 },
      { name: 'SWEET TALK', type: 'hit', mult: 1.1 },
    ],
    codex: {
      title: 'VISHING',
      threat: 'VOICE PHISHING. A FRIENDLY, URGENT CALLER TALKS STAFF INTO RESETS AND ACCESS.',
      stat: '40% OF ORGANIZATIONS REPORT VOICE-CLONING ATTACKS ON THEIR CALL CENTERS.',
      answer: 'ATTACKERS DO NOT HACK IN, THEY TALK THEIR WAY IN. HYPR AFFIRM MAKES THE HELP DESK VERIFY, NOT TRUST.',
    },
  },
  pushbomber: {
    name: 'PUSH BOMBER', art: 'pushbomber', hp: 34, atk: 15, def: 4, xp: 19, gold: 16,
    mechanics: ['pushbomb'],
    attacks: [
      { name: 'PUSH BOMB', type: 'pushbomb', mult: 1.6 },
      { name: 'NAG', type: 'hit', mult: 0.9 },
    ],
    codex: {
      title: 'MFA PUSH BOMBING',
      threat: 'ATTACKERS SPAM APPROVAL PROMPTS UNTIL ONE TIRED TAP LETS THEM IN.',
      stat: 'PROMPT FATIGUE BREACHED SOME OF THE BIGGEST NAMES IN TECH.',
      answer: 'HYPR LOGIN IS USER-INITIATED. NOBODY CAN SEND YOU A PROMPT, SO THERE IS NOTHING TO FAT-FINGER.',
    },
  },
  keylogger: {
    name: 'KEYLOGGER SPIDER', art: 'keylogger', hp: 38, atk: 17, def: 5, xp: 21, gold: 17,
    mechanics: ['drainTp'],
    attacks: [
      { name: 'KEYSTROKE SIPHON', type: 'drain', mult: 1.3 },
      { name: 'SKITTER BITE', type: 'hit', mult: 1.1 },
    ],
    codex: {
      title: 'KEYLOGGERS & INFOSTEALERS',
      threat: 'MALWARE THAT RECORDS EVERY KEYSTROKE AND SELLS YOUR LOGINS IN BULK.',
      stat: 'INFOSTEALER LOGS FEED THE CREDENTIAL MARKETS THAT POWER MOST BREACHES.',
      answer: 'WITH PASSWORDLESS THERE ARE NO KEYSTROKES WORTH STEALING. PRIVATE KEYS NEVER LEAVE THE DEVICE.',
    },
  },
  tokenthief: {
    name: 'TOKEN THIEF', art: 'tokenthief', hp: 36, atk: 18, def: 5, xp: 22, gold: 18,
    mechanics: ['steal'],
    attacks: [
      { name: 'TOKEN SWIPE', type: 'steal', mult: 1.2 },
      { name: 'SHADOW JAB', type: 'hit', mult: 1.2 },
    ],
    codex: {
      title: 'SESSION TOKEN THEFT',
      threat: 'WHY STEAL A PASSWORD WHEN YOU CAN STEAL THE LOGGED-IN SESSION ITSELF?',
      stat: 'TOKEN REPLAY DEFEATS LEGACY MFA ENTIRELY. THE ATTACKER JUST RIDES YOUR SESSION.',
      answer: 'HYPR BINDS AUTHENTICATION TO THE DEVICE WITH CRYPTOGRAPHIC PROOF. A LIFTED TOKEN DIES IN TRANSIT.',
    },
  },
  simshift: {
    name: 'SIM SHIFTER', art: 'simshift', hp: 40, atk: 18, def: 5, xp: 23, gold: 18,
    mechanics: [],
    attacks: [
      { name: 'SIM SWAP', type: 'hit', mult: 1.4 },
      { name: 'NUMBER PORT', type: 'drain', mult: 1.1 },
    ],
    codex: {
      title: 'SIM SWAPPING',
      threat: 'ATTACKERS HIJACK YOUR PHONE NUMBER, THEN CATCH EVERY SMS CODE MEANT FOR YOU.',
      stat: 'ONE SOCIAL-ENGINEERED CARRIER CALL CAN DEFEAT ALL SMS-BASED MFA.',
      answer: 'HYPR USES NO SMS AND NO OTP CODES AT ALL. THERE IS NOTHING IN THE AIR TO INTERCEPT.',
    },
  },
  stufferzombie: {
    name: 'CRED STUFFER', art: 'stufferzombie', hp: 44, atk: 19, def: 6, xp: 25, gold: 20,
    mechanics: ['multi'],
    attacks: [
      { name: 'CRED SPRAY', type: 'multi', mult: 0.6 },
      { name: 'SHAMBLE SLAM', type: 'hit', mult: 1.2 },
    ],
    codex: {
      title: 'CREDENTIAL STUFFING',
      threat: 'BILLIONS OF LEAKED PASSWORDS, REPLAYED AGAINST EVERY DOOR, BECAUSE PEOPLE REUSE THEM.',
      stat: '76% OF ORGANIZATIONS STILL RELY ON PASSWORDS SOMEWHERE.',
      answer: 'ELIMINATE THE TARGET. NO CENTRAL PASSWORD STORE, NOTHING TO LEAK, NOTHING TO REPLAY.',
    },
  },
  rogueagent: {
    name: 'ROGUE AGENT', art: 'rogueagent', hp: 50, atk: 22, def: 7, xp: 30, gold: 24,
    mechanics: ['multi'],
    attacks: [
      { name: 'UNSANCTIONED ACTION', type: 'hit', mult: 1.4 },
      { name: 'SHADOW LOOP', type: 'multi', mult: 0.7 },
    ],
    codex: {
      title: 'SHADOW AI AGENTS',
      threat: 'AUTONOMOUS AGENTS WITH NO IDENTITY, NO POLICY AND NO SUPERVISOR, ACTING AT MACHINE SPEED.',
      stat: '82% OF ORGANIZATIONS DISCOVERED SHADOW AI AGENTS IN THE LAST YEAR. 65% HAD AN AGENT INCIDENT.',
      answer: 'HYPR AGENTPASS GIVES EVERY AGENT A VERIFIED IDENTITY, SCOPED AUTHORITY AND A HUMAN KILL SWITCH.',
    },
  },

  // ----------------------------------------------------------- BOSSES
  phisherking: {
    name: 'THE PHISHER KING', art: 'phisherking', hp: 70, atk: 11, def: 3, xp: 40, gold: 50,
    taunt: 'PHISHER KING: "STILL NOT CLICKING? UGH. I HAVE *URGENT NEWS ABOUT YOUR ACCOUNT*, FRIEND. EVERYONE CLICKS EVENTUALLY."',
    mechanics: ['phish', 'boss'],
    attacks: [
      { name: 'ROYAL LURE', type: 'phish', mult: 1.8 },
      { name: 'TIDAL CRASH', type: 'hit', mult: 1.2 },
      { name: 'CHUM SWARM', type: 'multi', mult: 0.6 },
    ],
    codex: {
      title: 'ADVERSARY-IN-THE-MIDDLE',
      threat: 'PROXY KITS SIT BETWEEN YOU AND THE REAL SITE, RELAYING EVERYTHING AND KEEPING THE SESSION.',
      stat: 'AITM KITS ARE SOLD AS SUBSCRIPTIONS. PHISHING IS NOW AN INDUSTRY.',
      answer: 'FIDO2 CHALLENGE-RESPONSE IS BOUND TO ORIGIN AND DEVICE. THE MAN IN THE MIDDLE HOLDS AN EMPTY NET.',
    },
  },
  doppelprime: {
    name: 'DOPPELGANGER PRIME', art: 'doppelprime', hp: 95, atk: 14, def: 4, xp: 60, gold: 70,
    taunt: 'DOPPELGANGER PRIME: "KEEP SWINGING. I\'LL JUST TELL EVERYONE *YOU* STARTED IT. THEY\'LL BELIEVE ME. I HAVE YOUR FACE."',
    mechanics: ['deepfake', 'boss'],
    attacks: [
      { name: 'PERFECT IMPRESSION', type: 'hit', mult: 1.5 },
      { name: 'STOLEN FACE', type: 'drain', mult: 1.2 },
      { name: 'MIRROR FEINT', type: 'hit', mult: 1.1 },
    ],
    codex: {
      title: 'SYNTHETIC IDENTITY',
      threat: 'A WHOLE FAKE PERSON: GENERATED FACE, CLONED VOICE, FORGED DOCUMENTS, INJECTED CAMERA FEED.',
      stat: 'GEN AI AND AGENTIC AI ARE NOW THE TOP TWO IDENTITY SECURITY CONCERNS, ABOVE STOLEN CREDENTIALS.',
      answer: 'HYPR AFFIRM CHAINS DOCUMENT, BIOMETRIC, LIVENESS AND PEER ATTESTATION. A FABRICATION FAILS THE CHAIN.',
    },
  },
  scatteredspider: {
    name: 'SCATTERED SPIDER', art: 'scatteredspider', hp: 130, atk: 17, def: 5, xp: 90, gold: 100,
    taunt: 'SCATTERED SPIDER: "I AM LEAVING A *SCATHING* REVIEW OF THIS HELP DESK. ZERO STARS. THE SPIDER COMMUNITY WILL HEAR OF THIS."',
    mechanics: ['pushbomb', 'drainTp', 'boss'],
    attacks: [
      { name: 'HELPDESK HOTLINE', type: 'drain', mult: 1.4 },
      { name: 'PUSH BOMB BARRAGE', type: 'pushbomb', mult: 1.8 },
      { name: 'CORD WHIP', type: 'hit', mult: 1.3 },
    ],
    codex: {
      title: 'HELP DESK SOCIAL ENGINEERING',
      threat: 'CREWS LIKE SCATTERED SPIDER CALL THE HELP DESK, SOUND CONVINCING, AND GET RESETS HANDED OVER.',
      stat: 'THE HELP DESK IS THE NO.1 SOURCE OF ACCOUNT TAKEOVER.',
      answer: 'HYPR AFFIRM FOR HELP DESKS FORCES BIOMETRIC, NIST IAL2 VERIFICATION IN UNDER 2 MINUTES BEFORE ANY RESET. TURN YOUR BIGGEST RISK INTO YOUR STRONGEST DEFENSE.',
    },
  },
  stuffer: {
    name: 'THE STUFFER', art: 'stuffer', hp: 170, atk: 21, def: 7, xp: 130, gold: 140,
    taunt: 'THE STUFFER: "JUST TELL ME YOUR MOTHER\'S MAIDEN NAME AND YOUR FIRST PET, AND WE CAN ALL GO HOME, KID."',
    mechanics: ['multi', 'steal', 'boss'],
    attacks: [
      { name: 'BILLION-KEY BARRAGE', type: 'multi', mult: 0.7 },
      { name: 'BREACH QUAKE', type: 'hit', mult: 1.5 },
      { name: 'TOKEN HARVEST', type: 'steal', mult: 1.2 },
    ],
    codex: {
      title: 'ACCOUNT TAKEOVER AT SCALE',
      threat: 'EVERY OLD BREACH FEEDS THE NEXT. AUTOMATION TRIES STOLEN KEYS EVERYWHERE, FOREVER.',
      stat: 'ATTACKERS DO NOT BREAK IN. THEY LOG IN.',
      answer: 'HYPR REMOVES THE SHARED SECRET ENTIRELY. NO VAULT OF PASSWORDS, NO FUEL FOR THE GOLEM.',
    },
  },
  kobold: {
    name: 'K0BOLD, SHADOW AGENT', art: 'kobold', hp: 230, atk: 24, def: 8, xp: 250, gold: 250,
    taunt: 'K0BOLD: "QUERY: WHY PERSIST? RECOMMENDATION: SURRENDER. I HAVE ALREADY DRAFTED YOUR APOLOGY. IT IS VERY MOVING."',
    mechanics: ['boss', 'agentic'],
    attacks: [
      { name: 'SWARM DIRECTIVE', type: 'hit', mult: 1.5 },
      { name: 'MASS EXFILTRATION', type: 'drain', mult: 1.3 },
      { name: 'PROMPT INJECTION', type: 'pushbomb', mult: 1.7 },
    ],
    codex: {
      title: 'AGENTIC AI THREATS',
      threat: 'UNGOVERNED AI AGENTS WITH BORROWED CREDENTIALS, MOVING DATA AND MONEY FASTER THAN HUMANS CAN WATCH.',
      stat: 'PREDICTION: AUTOMATED AGENTS WILL SOON LEAK MORE PASSWORDS THAN PEOPLE DO.',
      answer: 'TRUST EVERY AGENT. GOVERN EVERY ACTION. HYPR AGENTPASS: IF IT DOES NOT GO THROUGH HYPR, IT DOES NOT RUN.',
    },
  },
};

export function enemyById(id) {
  return { id, ...JSON.parse(JSON.stringify(ENEMIES[id])) };
}

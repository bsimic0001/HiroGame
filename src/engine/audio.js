// Tiny chiptune engine: pulse/triangle/noise channels, lookahead scheduler, baked-in songs.
// Note token: "C4:2" (note:sixteenths) or "-:4" (rest). Channels loop independently per song.

const NOTE_IDX = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
function freq(tok) {
  const m = tok.match(/^([A-G]#?)(\d)$/);
  if (!m) return 0;
  const midi = NOTE_IDX[m[1]] + (parseInt(m[2]) + 1) * 12;
  return 440 * Math.pow(2, (midi - 69) / 12);
}
function parse(str) {
  return str.trim().split(/\s+/).map((t) => {
    const [n, d] = t.split(':');
    return { f: n === '-' ? 0 : freq(n), d: parseInt(d || '1') };
  });
}

// ----- Songs -----------------------------------------------------------------
const SONGS = {
  title: {
    bpm: 100,
    lead: `A3:4 C4:2 E4:2 A4:4 G4:2 E4:2 F4:4 A4:2 C5:2 E5:6 -:2
           D5:4 C5:2 B4:2 C5:4 A4:2 E4:2 G4:6 E4:2 A4:8`,
    bass: `A2:8 F2:8 C3:8 G2:8 A2:8 F2:8 E2:8 E2:8`,
    noise: ``,
  },
  town: {
    bpm: 112,
    lead: `E4:2 G4:2 A4:2 G4:2 E4:4 C4:4 D4:2 E4:2 F4:2 E4:2 D4:4 G3:4
           E4:2 G4:2 A4:2 B4:2 C5:4 A4:4 G4:2 E4:2 D4:2 E4:2 C4:8`,
    bass: `C3:4 G2:4 A2:4 E2:4 F2:4 C3:4 G2:4 G2:4 C3:4 G2:4 A2:4 E2:4 F2:4 G2:4 C3:8`,
    noise: `x:4 x:4 x:4 x:4`,
  },
  overworld: {
    bpm: 124,
    lead: `A4:2 A4:2 C5:2 D5:2 E5:4 E5:2 D5:2 C5:2 D5:2 E5:2 C5:2 A4:6 -:2
           G4:2 G4:2 B4:2 C5:2 D5:4 D5:2 C5:2 B4:2 C5:2 D5:2 B4:2 G4:6 -:2
           F4:2 A4:2 C5:2 F5:2 E5:4 C5:2 A4:2 D5:2 C5:2 B4:2 G4:2 A4:8`,
    bass: `A2:4 E3:4 A2:4 E3:4 G2:4 D3:4 G2:4 D3:4 F2:4 C3:4 G2:4 E3:4 A2:4 E3:4 A2:8`,
    noise: `x:2 -:2 x:2 x:2`,
  },
  battle: {
    bpm: 150,
    lead: `E4:2 E4:2 G4:2 E4:2 A4:2 G4:2 E4:2 D4:2 E4:2 E4:2 G4:2 A4:2 B4:4 A4:2 G4:2
           C5:2 B4:2 A4:2 G4:2 A4:2 G4:2 E4:2 D4:2 E4:4 G4:4 E4:4 -:4`,
    bass: `E2:2 E2:2 E3:2 E2:2 E2:2 E3:2 E2:2 E2:2 G2:2 G2:2 G3:2 G2:2 A2:2 A2:2 A3:2 A2:2
           C3:2 C3:2 C2:2 C3:2 B2:2 B2:2 B1:2 B2:2 E2:2 E2:2 E3:2 E2:2 E2:4 -:2`,
    noise: `x:2 x:2 X:2 x:2`,
  },
  boss: {
    bpm: 160,
    lead: `D4:2 D4:2 F4:2 D4:2 G#4:2 G4:2 F4:2 D4:2 D4:2 F4:2 G4:2 G#4:2 A4:4 G#4:2 F4:2
           D5:2 C5:2 A#4:2 A4:2 A#4:2 A4:2 F4:2 D4:2 C#4:4 D4:4 A3:4 -:4`,
    bass: `D2:2 D2:2 D3:2 D2:2 C2:2 C2:2 C3:2 C2:2 A#1:2 A#1:2 A#2:2 A#1:2 A1:2 A1:2 A2:2 A1:2`,
    noise: `X:2 x:2 x:2 X:2 x:2 x:2 X:2 x:2`,
  },
  vault: {
    bpm: 140,
    lead: `C4:2 -:2 C4:2 D#4:2 G4:4 F4:2 D#4:2 D4:2 -:2 D4:2 F4:2 G#4:4 G4:2 F4:2
           G#4:2 G4:2 F4:2 D#4:2 F4:2 D#4:2 C4:2 A#3:2 B3:4 C4:4 G3:4 -:4`,
    bass: `C2:4 G2:4 C2:4 G2:4 D2:4 A2:4 D2:4 A2:4 G#1:4 D#2:4 G1:4 D2:4 C2:4 G2:4 C2:8`,
    noise: `x:4 x:2 x:2 X:4 x:4`,
  },
  ending: {
    bpm: 92,
    lead: `C5:4 B4:2 A4:2 G4:4 E4:4 F4:2 G4:2 A4:4 G4:6 -:2
           E4:2 G4:2 C5:2 E5:2 D5:4 C5:2 B4:2 C5:8 -:4`,
    bass: `C3:8 F2:8 A2:8 G2:8 C3:8 F2:8 G2:8 C3:8`,
    noise: ``,
  },
};

// ----- Engine ----------------------------------------------------------------
let ctx = null;
let master, musicGain, sfxGain;
let muted = localStorage.getItem('hiro.muted') === '1';
let current = null; // { name, channels: [{notes,i,nextTime}], timer }

function ensureCtx() {
  if (ctx) return true;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.14; musicGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.22; sfxGain.connect(master);
  } catch { return false; }
  return true;
}

let noiseBuf = null;
function getNoiseBuf() {
  if (noiseBuf) return noiseBuf;
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

function scheduleNote(ch, when, dur) {
  if (ch.kind === 'noise') {
    const src = ctx.createBufferSource();
    src.buffer = getNoiseBuf();
    const g = ctx.createGain();
    const loud = ch.tok === 'X' ? 0.5 : 0.25;
    g.gain.setValueAtTime(loud, when);
    g.gain.exponentialRampToValueAtTime(0.01, when + Math.min(dur, 0.08));
    src.connect(g); g.connect(musicGain);
    src.start(when); src.stop(when + Math.min(dur, 0.1));
    return;
  }
  const osc = ctx.createOscillator();
  osc.type = ch.kind; // 'square' | 'triangle'
  osc.frequency.value = ch.f;
  const g = ctx.createGain();
  const vol = ch.kind === 'triangle' ? 0.9 : 0.5;
  g.gain.setValueAtTime(vol, when);
  g.gain.setValueAtTime(vol, when + dur * 0.7);
  g.gain.linearRampToValueAtTime(0, when + dur * 0.95);
  osc.connect(g); g.connect(musicGain);
  osc.start(when); osc.stop(when + dur);
}

function startSong(name) {
  const song = SONGS[name];
  if (!song) return;
  stopSong();
  const sixteenth = 60 / song.bpm / 4;
  const channels = [];
  const mk = (str, kind) => {
    if (!str || !str.trim()) return;
    const notes = kind === 'noise'
      ? str.trim().split(/\s+/).map((t) => { const [n, d] = t.split(':'); return { tok: n, f: n === '-' ? 0 : 1, d: parseInt(d || '1') }; })
      : parse(str);
    channels.push({ kind, notes, i: 0, next: ctx.currentTime + 0.05 });
  };
  mk(song.lead, 'square');
  mk(song.bass, 'triangle');
  mk(song.noise, 'noise');
  const timer = setInterval(() => {
    if (!ctx) return;
    const horizon = ctx.currentTime + 0.15;
    for (const ch of channels) {
      while (ch.next < horizon) {
        const n = ch.notes[ch.i];
        const dur = n.d * sixteenth;
        if (n.f) scheduleNote({ kind: ch.kind, f: n.f, tok: n.tok }, ch.next, dur);
        ch.next += dur;
        ch.i = (ch.i + 1) % ch.notes.length;
      }
    }
  }, 40);
  current = { name, timer };
}

function stopSong() {
  if (current) { clearInterval(current.timer); current = null; }
}

// ----- SFX -------------------------------------------------------------------
function blip(f0, f1, dur, type = 'square', vol = 1) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.6 * vol, t);
  g.gain.exponentialRampToValueAtTime(0.01, t + dur);
  osc.connect(g); g.connect(sfxGain);
  osc.start(t); osc.stop(t + dur);
}
function noiseHit(dur, vol = 1) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource(); src.buffer = getNoiseBuf();
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.7 * vol, t);
  g.gain.exponentialRampToValueAtTime(0.01, t + dur);
  src.connect(g); g.connect(sfxGain);
  src.start(t); src.stop(t + dur);
}

const SFX = {
  select: () => blip(880, 1320, 0.06),
  cancel: () => blip(440, 220, 0.08),
  confirm: () => { blip(660, 990, 0.07); setTimeout(() => blip(990, 1320, 0.07), 60); },
  bump: () => blip(160, 110, 0.06, 'triangle'),
  hit: () => { noiseHit(0.12); blip(220, 80, 0.12, 'square', 0.7); },
  hurt: () => { noiseHit(0.18, 0.8); blip(180, 60, 0.2, 'sawtooth', 0.8); },
  immune: () => { blip(1200, 1200, 0.05); setTimeout(() => blip(1600, 1600, 0.08), 70); },
  heal: () => { blip(523, 784, 0.1, 'triangle'); setTimeout(() => blip(784, 1046, 0.12, 'triangle'), 90); },
  levelup: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => blip(f, f, 0.1), i * 90)); },
  item: () => { blip(784, 784, 0.08); setTimeout(() => blip(1046, 1046, 0.12), 80); },
  scan: () => { blip(400, 1800, 0.25, 'sawtooth', 0.4); },
  reveal: () => { blip(1568, 392, 0.3, 'square', 0.6); },
  boss: () => { blip(80, 40, 0.5, 'sawtooth', 1); noiseHit(0.4, 0.6); },
  win: () => { [659, 659, 659, 523, 659, 784].forEach((f, i) => setTimeout(() => blip(f, f, 0.09), i * 100)); },
  encounter: () => { blip(200, 800, 0.15); setTimeout(() => blip(800, 200, 0.15), 120); },
  step: () => {},
};

let silentEl = null;

export const Audio = {
  unlock() {
    if (!ensureCtx()) return;
    if (ctx.state === 'suspended') ctx.resume();
    // iOS: route the audio session to 'playback' by looping a silent <audio>,
    // otherwise the physical ring/silent switch mutes all WebAudio.
    if (!silentEl) {
      silentEl = document.createElement('audio');
      silentEl.setAttribute('playsinline', '');
      silentEl.loop = true;
      silentEl.volume = 0.01;
      // 8 samples of 8-bit silence
      silentEl.src = 'data:audio/wav;base64,UklGRiwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQgAAACAgICAgICAgA==';
      silentEl.play().catch(() => { silentEl = null; }); // retry on next gesture
    }
  },
  play(name) {
    if (!ensureCtx()) return;
    if (current && current.name === name) return;
    startSong(name);
  },
  stop() { stopSong(); },
  sfx(name) { if (ensureCtx() && SFX[name]) SFX[name](); },
  toggleMute() {
    muted = !muted;
    localStorage.setItem('hiro.muted', muted ? '1' : '0');
    if (master) master.gain.value = muted ? 0 : 1;
    return muted;
  },
  get muted() { return muted; },
};

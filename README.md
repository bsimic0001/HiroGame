# HIRO: Identity Under Siege

A 32-bit-style browser RPG starring **Hiro the Hedgehog**, HYPR's mascot, on a
quest to rid the Realm of Identia of the Phantom Legion — because hackers
don't break in, they log in.

Five chapters follow the identity lifecycle's weakest links. Each chapter's
artifact is a HYPR product in costume, and each enemy is a real identity
attack. Defeating enemies fills the **Threat Codex**: the real-world attack, a
real stat, and how HYPR stops it.

| Chapter | Place | Artifact | Boss |
|---|---|---|---|
| 1 | The Phishing Shoals | Passkey Blade (Authenticate) | The Phisher King |
| 2 | The Onboarding Gate | Mirror of Affirm (Identity Verification) | Doppelganger Prime |
| 3 | Help Desk Keep | Help Desk Sigil (Affirm for Help Desks) | Scattered Spider |
| 4 | The Endpoint Frontier | Adapt Visor + Enterprise Passkey Armor | The Stuffer |
| 5 | The Vault of Shared Secrets | AgentPass Crown | K0BOLD, Shadow Agent |

The finale: approve, deny, and kill-switch a rogue agent swarm, then
**ELIMINATE THE TARGET** — destroy the password vault itself.

## Play it

Any static hosting works — there is no build step and zero dependencies:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Or just open `index.html` in a browser. Progress autosaves to localStorage.
A full playthrough takes about 30–40 minutes.

## Controls

- **Move:** arrow keys / WASD (touch: on-screen D-pad)
- **Confirm / talk:** Z, Enter, or Space (touch: A)
- **Cancel / menu:** X or Esc (touch: B)
- **Mute:** M

## Tech

Vanilla ES modules + Canvas 2D at 240x160, integer-scaled. All sprites and
tiles are code-authored pixel art (`src/art/`), music is a tiny WebAudio
chiptune sequencer (`src/engine/audio.js`), maps are ASCII grids
(`src/data/maps.js`), and every line of dialogue lives in
`src/data/script.js`.

Dev checks:

```bash
node scripts/validate.mjs     # data integrity: maps, portals, dialogs, sprites
node scripts/playtest.mjs     # headless Chromium playtest (needs playwright)
```

Official Hiro artwork and Rajdhani fonts come from HYPR Brand Central
(`assets/`). Want the real Passkey Blade? **hypr.com**

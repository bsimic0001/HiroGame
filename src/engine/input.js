// Unified keyboard + touch input. Logical buttons: up/down/left/right/a (confirm)/b (cancel)/mute.
const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  KeyZ: 'a', Enter: 'a', Space: 'a',
  KeyX: 'b', Escape: 'b', Backspace: 'b',
  KeyM: 'mute',
};

const held = {};
const pressedQueue = {};
let anyKeyListeners = [];

function press(btn) {
  if (!held[btn]) pressedQueue[btn] = true;
  held[btn] = true;
  for (const fn of anyKeyListeners) fn();
  anyKeyListeners = [];
}
function release(btn) { held[btn] = false; }

export const Input = {
  init() {
    window.addEventListener('keydown', (e) => {
      const btn = KEYMAP[e.code];
      if (btn) { e.preventDefault(); press(btn); }
    });
    window.addEventListener('keyup', (e) => {
      const btn = KEYMAP[e.code];
      if (btn) release(btn);
    });

    // Touch buttons
    const tmap = { 'd-up': 'up', 'd-down': 'down', 'd-left': 'left', 'd-right': 'right', 'b-a': 'a', 'b-b': 'b' };
    for (const [id, btn] of Object.entries(tmap)) {
      const el = document.getElementById(id);
      if (!el) continue;
      const down = (e) => { e.preventDefault(); el.classList.add('held'); press(btn); };
      const up = (e) => { e.preventDefault(); el.classList.remove('held'); release(btn); };
      el.addEventListener('touchstart', down, { passive: false });
      el.addEventListener('touchend', up, { passive: false });
      el.addEventListener('touchcancel', up, { passive: false });
      el.addEventListener('mousedown', down);
      el.addEventListener('mouseup', up);
      el.addEventListener('mouseleave', up);
    }
    window.addEventListener('touchstart', () => document.body.classList.add('touch'), { once: true });
  },

  // True only on the frame the button went down.
  pressed(btn) { return !!pressedQueue[btn]; },
  held(btn) { return !!held[btn]; },
  // Direction helper for menus with key-repeat feel handled by scenes.
  dir() {
    if (pressedQueue.up) return 'up';
    if (pressedQueue.down) return 'down';
    if (pressedQueue.left) return 'left';
    if (pressedQueue.right) return 'right';
    return null;
  },
  onceAnyInput(fn) { anyKeyListeners.push(fn); },
  endFrame() { for (const k in pressedQueue) delete pressedQueue[k]; },
};

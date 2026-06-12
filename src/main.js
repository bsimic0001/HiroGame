import { Input } from './engine/input.js';
import { Audio } from './engine/audio.js';
import { Scenes } from './engine/scenes.js';
import { drawBrand } from './art/logo.js';
import './scenes/title.js';
import './scenes/overworld.js';
import './scenes/battle.js';
import './scenes/codex.js';
import './scenes/ending.js';
import './scenes/cutscene.js';

export const W = 240, H = 160;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function resize() {
  const isTouch = document.body.classList.contains('touch');
  const availW = window.innerWidth - 16 - 28; // frame padding + border
  // reserve room for the controls bar, frame, and the brand plaque overhang
  const availH = window.innerHeight - (isTouch ? 8 : 72) - 46;
  let scale = Math.floor(Math.min(availW / W, availH / H));
  // Small screens (phones): fill with non-integer scale rather than stay tiny
  if (scale < 2) scale = Math.min(availW / W, availH / H);
  scale = Math.max(0.5, scale);
  canvas.style.width = `${Math.floor(W * scale)}px`;
  canvas.style.height = `${Math.floor(H * scale)}px`;
}
window.addEventListener('resize', resize);
resize();
drawBrand(document.getElementById('brand'));

Input.init();
// Keep unlocking on every gesture: mobile browsers can re-suspend the
// context (tab switch, lock screen), and iOS only resumes in-gesture.
// Capture phase so D-pad handlers can never swallow the gesture first.
for (const ev of ['keydown', 'touchstart', 'touchend', 'mousedown']) {
  window.addEventListener(ev, () => Audio.unlock(), { capture: true, passive: true });
}
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) Audio.unlock();
});

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const scene = Scenes.current;
  if (scene) {
    if (Input.pressed('mute')) Audio.toggleMute();
    scene.update(dt);
    // game logic runs at 240x160; the canvas renders at 480x320 so hi-res
    // character art can show single-pixel detail
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    if (Scenes.current) Scenes.current.draw(ctx);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  Input.endFrame();
  requestAnimationFrame(frame);
}

Scenes.go('title');
requestAnimationFrame(frame);

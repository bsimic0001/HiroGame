// Shared UI: panels, dialog box with typewriter, vertical menus.
import { drawText, wrap, CHAR_W, LINE_H } from './font.js';
import { Input } from './input.js';
import { Audio } from './audio.js';

export function panel(ctx, x, y, w, h) {
  // drop shadow
  ctx.fillStyle = 'rgba(5,3,12,0.45)';
  ctx.fillRect(x + 2, y + 2, w, h);
  // gradient body
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#1c1342');
  g.addColorStop(1, '#0f0a26');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#8a5cff';
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.strokeStyle = '#312263';
  ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  // teal corner studs
  ctx.fillStyle = '#19d3c5';
  ctx.fillRect(x + 1, y + 1, 2, 2);
  ctx.fillRect(x + w - 3, y + 1, 2, 2);
  ctx.fillRect(x + 1, y + h - 3, 2, 2);
  ctx.fillRect(x + w - 3, y + h - 3, 2, 2);
}

// --------------------------------------------------------------- Dialog
// Pages are 'SPEAKER|text' or 'text'. Call update() each frame; draw() after.
// done === true once the last page is dismissed.
export class Dialog {
  constructor(pages) {
    this.pages = pages.slice();
    this.page = 0;
    this.chars = 0;
    this.done = false;
    if (window.__hiroLog) window.__hiroLog.push('DLG:' + pages.join(' / ')); // test harness hook
  }
  current() {
    const raw = this.pages[this.page] || '';
    const i = raw.indexOf('|');
    if (i > 0 && i < 24) return { who: raw.slice(0, i), text: raw.slice(i + 1) };
    return { who: null, text: raw };
  }
  update(dt) {
    if (this.done) return;
    const { text } = this.current();
    if (this.chars < text.length) {
      this.chars += dt * 90;
      if (Input.pressed('a') || Input.pressed('b')) this.chars = text.length;
    } else if (Input.pressed('a')) {
      Audio.sfx('select');
      this.page++;
      this.chars = 0;
      if (this.page >= this.pages.length) this.done = true;
    }
  }
  draw(ctx, W, H) {
    if (this.done) return;
    const { who, text } = this.current();
    const bh = 44;
    panel(ctx, 2, H - bh - 2, W - 4, bh);
    if (who) {
      const nw = who.length * CHAR_W + 8;
      panel(ctx, 6, H - bh - 8, nw, 12);
      drawText(ctx, who, 10, H - bh - 5, '#19d3c5');
    }
    const lines = wrap(text, 37);
    const shown = Math.floor(this.chars);
    let count = 0;
    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      const line = lines[i];
      const take = Math.max(0, Math.min(line.length, shown - count));
      drawText(ctx, line.slice(0, take), 8, H - bh + 6 + i * LINE_H, '#ffffff');
      count += line.length;
    }
    if (shown >= text.length) {
      if (Math.floor(performance.now() / 400) % 2 === 0) {
        drawText(ctx, '>', W - 16, H - 12, '#19d3c5');
      }
    }
  }
}

// --------------------------------------------------------------- Menu
export class Menu {
  constructor(items, opts = {}) {
    this.items = items; // [{ label, value, note }]
    this.i = 0;
    this.opts = opts;
  }
  // returns { value } on select, 'cancel' on cancel, null otherwise
  update() {
    if (Input.pressed('up')) { this.i = (this.i + this.items.length - 1) % this.items.length; Audio.sfx('select'); }
    if (Input.pressed('down')) { this.i = (this.i + 1) % this.items.length; Audio.sfx('select'); }
    if (Input.pressed('a')) { Audio.sfx('confirm'); return { value: this.items[this.i].value, item: this.items[this.i] }; }
    if (Input.pressed('b') && !this.opts.noCancel) { Audio.sfx('cancel'); return 'cancel'; }
    return null;
  }
  draw(ctx, x, y, w) {
    const h = this.items.length * LINE_H + 12;
    panel(ctx, x, y, w, h);
    this.items.forEach((it, idx) => {
      const ly = y + 7 + idx * LINE_H;
      if (idx === this.i) drawText(ctx, '▶', x + 5, ly, '#19d3c5');
      // labels never collide with right-aligned notes: truncate to the gap
      const noteW = it.note ? it.note.length * CHAR_W + 4 : 0;
      const maxChars = Math.floor((w - 13 - 6 - noteW) / CHAR_W);
      const label = it.label.length > maxChars ? it.label.slice(0, Math.max(1, maxChars - 1)) + '.' : it.label;
      drawText(ctx, label, x + 13, ly, idx === this.i ? '#ffffff' : '#b8b3d6');
      if (it.note) drawText(ctx, it.note, x + w - 6 - it.note.length * CHAR_W, ly, '#8d86b8');
    });
    return h;
  }
}

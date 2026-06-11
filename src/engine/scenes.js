// Scene registry + switcher. Scenes: { enter(params), update(dt), draw(ctx) }.
const registry = {};
let current = null;
let currentName = '';

export const Scenes = {
  register(name, scene) { registry[name] = scene; },
  go(name, params) {
    current = registry[name];
    currentName = name;
    if (current && current.enter) current.enter(params || {});
  },
  get current() { return current; },
  get name() { return currentName; },
};

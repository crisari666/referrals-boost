import * as imported from 'trim-canvas/build/index.js';

function unwrap(m: unknown): (canvas: HTMLCanvasElement) => HTMLCanvasElement {
  let cur: unknown = m;
  for (let i = 0; i < 8; i += 1) {
    if (typeof cur === 'function') {
      return cur as (canvas: HTMLCanvasElement) => HTMLCanvasElement;
    }
    if (cur && typeof cur === 'object' && 'default' in cur) {
      cur = (cur as { default: unknown }).default;
      continue;
    }
    break;
  }
  throw new Error('trim-canvas: could not resolve function export');
}

export default unwrap(imported.default ?? imported);

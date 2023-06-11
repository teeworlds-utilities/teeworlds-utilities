import { createCanvas } from 'canvas';

import Cache from './cache';
import { cacheCanvas } from './utils/canvas';

describe('Cache', () => {
  test('Double set the same then get', () => {
    const cache = new Cache<string>;

    cache.set('hello', 'world');

    expect(cache.set('hello', 'world')).toBe(false);
    expect(cache.get('hello')).toBe('world')
    expect(cache.get('unknown')).toBeNull();
  });

  test('Set from the global canvas cache', () => {
    const canvas = createCanvas(100, 100);

    let ctx = canvas.getContext('2d');
  
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    expect(cacheCanvas.set('blue_canvas', canvas)).toBe(true);
    expect(cacheCanvas.set('blue_canvas', canvas)).toBe(false);
  });

  test('Get from the global canvas cache', () => {
    expect(cacheCanvas.get('blue_canvas')).toHaveProperty('height');
  });
});

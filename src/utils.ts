import * as fs from 'fs';
import {
  Canvas,
  createCanvas,
  loadImage,
  CanvasRenderingContext2D,
} from 'canvas';

import {InvalidFile} from './error';

function saveInDir(dirname: string, filename: string, canvas: Canvas) {
  // Create directory if it doesnt exist
  if (!fs.existsSync(dirname)) fs.mkdirSync(dirname);

  // Save the element, only PNGs
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`${dirname}/${filename}`, buffer);
}

function isDigit(str: string): boolean {
  for (const char of str) {
    if ('1234567890'.includes(char) === false) return false;
  }

  return true;
}

function genChunks(src: string, size: number): string[] {
  const ret: string[] = [];

  for (let i = 0; i < src.length; i += size) ret.push(src.slice(i, i + size));

  return ret;
}

function closestNumber(n: number, m: number): number {
  const q = Math.floor(n / m);
  const n1 = m * q;
  let n2;

  if (n * m > 0) {
    n2 = m * (q + 1);
  } else {
    n2 = m * (q - 1);
  }

  if (Math.abs(n - n1) < Math.abs(n - n2)) return n1;

  return n2;
}

function listFile(path: string): string[] {
  const ret = fs.readdirSync(path);

  return ret;
}

async function getCanvasFromFile(path: string): Promise<Canvas> {
  let img;

  // Load image
  try {
    img = await loadImage(path);
  } catch (err) {
    throw new InvalidFile('Unable to get the image ' + path);
  }

  // If everything is OK, it creates the canvas and the context
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  return canvas;
}

function argsChecker(args: string[], ...neededArgs: string[]): boolean {
  for (const arg of args) {
    if (neededArgs.includes(arg) === false) {
      return false;
    }
  }

  return true;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  r: number,
  w: number,
  h: number,
  color: string
) {
  ctx.beginPath();

  ctx.moveTo(w, h);
  ctx.arcTo(0, h, 0, 0, r);
  ctx.arcTo(0, 0, w, 0, r);
  ctx.arcTo(w, 0, w, h, r);
  ctx.arcTo(w, h, 0, h, r);

  ctx.fillStyle = color;
  ctx.fill();
}

export {
  saveInDir,
  isDigit,
  genChunks,
  closestNumber,
  listFile,
  getCanvasFromFile,
  argsChecker,
  roundRect,
};

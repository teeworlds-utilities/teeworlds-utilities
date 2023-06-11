import { Canvas, createCanvas, loadImage, ImageData, CanvasRenderingContext2D } from 'canvas';
import { FileError } from '../error';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import Cache from '../cache';

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

function roundedImage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

async function getCanvasFromFile(path: string): Promise<Canvas> {
  let img;

  // Load image
  try {
    img = await loadImage(path);
  } catch (err) {
    throw new FileError('Unable to get the image ' + path);
  }

  // If everything is OK, it creates the canvas and the context
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  return canvas;
}

function saveCanvas(path: string, canvas: Canvas,) {
  // Create directory if it doesnt exist
  let dirs = path.split('/')
  
  // Remove the filename
  dirs.pop()

  // Creates directories if they don't exist
  for (const dir of dirs) {
    if (existsSync(dir) === false) {
      mkdirSync(dir);
    }
  }

  // Save the element, only PNGs
  writeFileSync(path, canvas.toBuffer('image/png'));
}

function canvasFromImageData(imageData: ImageData): Canvas {
  const canvas = createCanvas(
    imageData.width,
    imageData.height
  );

  const ctx = canvas.getContext('2d');

  ctx.putImageData(imageData, 0, 0);

  return canvas;
}

function cloneCanvas(oldCanvas: Canvas): Canvas {
  const canvas = createCanvas(
    oldCanvas.width,
    oldCanvas.height
  )
  let ctx = canvas.getContext('2d');

  ctx.drawImage(oldCanvas, 0, 0);

  return canvas;
}

/**
 * Global variable for the canvas cache;
 */
let cacheCanvas = new Cache<Canvas>;

export {
  roundRect,
  roundedImage,
  getCanvasFromFile,
  saveCanvas,
  cacheCanvas,
  canvasFromImageData,
  cloneCanvas
};

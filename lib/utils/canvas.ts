import { Image, Canvas, createCanvas, loadImage, ImageData, CanvasRenderingContext2D } from 'canvas';
import { AssetError, FileError } from '../error';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import Cache from '../cache';
import { Dimensions } from '../asset/base';
import { DIRECTION_HOZIRONTAL, DIRECTION_VERTICAL, DOWN, LEFT, RIGHT, TOP } from './util';

/**
 * The function draws a rounded rectangle on a canvas with a specified radius,
 * width, height, and color.
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} r - The radius of the rounded corners of the rectangle.
 * @param {number} w - The width of the rounded rectangle.
 * @param {number} h - The height of the rounded rectangle.
 * @param {string} color - String color
 */
export function roundRect(
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

/**
 * The function draws a rounded rectangle on a canvas context.
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - The x-coordinate of the top-left corner of the rounded
 * rectangle.
 * @param {number} y - The `y` parameter in the `roundedImage` function represents
 * the vertical coordinate of the top-left corner of the rounded rectangle.
 * @param {number} width - The width of the rounded image.
 * @param {number} height - The height of the rounded rectangle that will be drawn
 * on the canvas.
 * @param {number} radius - The radius parameter is the radius of the corners of
 * the rectangle that will be drawn. It is used in the quadraticCurveTo() method to
 * create rounded corners.
 */
export function roundedImage(
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

/**
 * This function loads an image from a file path and creates a canvas with
 * the same dimensions as the image.
 * @param {string} path - A string representing the file path of the image
 * that needs to be loaded.
 * @returns Canvas Promise
 */
export async function getCanvasFromFile(path: string): Promise<Canvas> {
  let img: Image;

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

/**
 * This function saves a canvas element as a PNG image to a specified path,
 * creating directories if they don't exist.
 * @param {string} path - A string representing the file path where the canvas will
 * be saved.
 * @param {Canvas} canvas - Canvas
 */
export function saveCanvas(path: string, canvas: Canvas,) {
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

/**
 * This function creates a canvas element from an ImageData object.
 * @param {ImageData} imageData - Image data
 * @returns A new canvas
 */
export function canvasFromImageData(imageData: ImageData): Canvas {
  const canvas = createCanvas(
    imageData.width,
    imageData.height
  );

  const ctx = canvas.getContext('2d');

  ctx.putImageData(imageData, 0, 0);

  return canvas;
}

/**
 * Clones a given canvas element by creating a new canvas
 * with the same dimensions and drawing the original canvas onto it.
 * @param {Canvas} oldCanvas - A source canvas
 * @returns A new canvas
 */
export function cloneCanvas(oldCanvas: Canvas): Canvas {
  const canvas = createCanvas(
    oldCanvas.width,
    oldCanvas.height
  )
  let ctx = canvas.getContext('2d');

  ctx.drawImage(oldCanvas, 0, 0);

  return canvas;
}

/**
 * Flip a canvas
 * @param oldCanvas - A source canvas 
 * @param flipX
 * @param flipY 
 * @returns A new canvas
 */
export function canvasFlip(
  oldCanvas: Canvas,
  flipX: boolean = false,
  flipY: boolean = false
): Canvas {
  if (flipX === false && flipY === false ) {
    return oldCanvas;
  }

  const ret = createCanvas(
    oldCanvas.width,
    oldCanvas.height
  )
  
  let retCtx = ret.getContext('2d');

  retCtx.translate(
    flipX ? ret.width : 0,
    flipY ? ret.height : 0
  );
  retCtx.scale(
    flipX ? -1 : 1,
    flipY ? -1 : 1
  );

  retCtx.drawImage(
    oldCanvas,
    0, 0
  );
  
  return ret;
}

/**
 * Scale a cavas
 * @param oldCanvas - A source canvas 
 * @param factor - Scale factor
 * @returns A new canvas
 */
export function scaleCanvas(oldCanvas: Canvas, factor: number): Canvas {
  const w = oldCanvas.width * factor;
  const h = oldCanvas.height * factor;

  return resizeCanvas(
    oldCanvas,
    {w: w, h: h}
  );
}

/**
 * 
 * @param oldCanvas - A source canvas
 * @param size - New canvas dimensions
 * @returns A new canvas
 */
export function resizeCanvas(oldCanvas: Canvas, size: Dimensions): Canvas {
  const canvas = createCanvas(size.w, size.h);
  let ctx = canvas.getContext('2d');

  ctx.drawImage(
    oldCanvas,
    0, 0,
    size.w, size.h,
  );

  return canvas;
}

/**
 * Rotate a canvas
 * @param oldCanvas - A source canvas
 * @param angle - Angle
 * @returns A new canvas
 */
export function rotateCanvas(oldCanvas: Canvas, angle: number): Canvas {
  angle %= 360;

  if (angle < 0) {
    angle *= -1;
  }

  const size = Math.max(
    oldCanvas.width,
    oldCanvas.height
  );

  const canvas = createCanvas(size, size);
  let ctx = canvas.getContext('2d');

  ctx.translate(canvas.width/2,canvas.height/2);
  ctx.rotate(angle * Math.PI / 180);
  ctx.drawImage(oldCanvas,-oldCanvas.width/2,-oldCanvas.height/2);
  ctx.rotate(-(angle * Math.PI / 180));
  ctx.translate(-canvas.width/2,-canvas.height/2);

  return canvas;
}

/**
 * Find the first column where its not full of empty pixel
 * @param imageData - Image data
 * @param from - Side where it starts to iterate
 * @returns X axis position
 */
function findOpaqueHorizontal(
  imageData: ImageData,
  from: number,
): number {
  let start: number;
  let end: number;
  let factor: number;
  let index: number;

  if (from === LEFT) {
    start = 0;
    end = imageData.width;
    factor = 1;
  } else {
    start = imageData.width;
    end = 0;
    factor = -1;
  }

  for (; start !== end; start += factor) {
    for (let y = 0; y < imageData.height; y++) {
      index = (y * imageData.width * 4) + (start * 4);
  
      if (imageData.data[index + 3] > 0) {
        return start;
      }
    }
  }

  return end;
}

/**
 * Find the first line where its not full of empty pixel
 * @param imageData - Image data
 * @param from - Side where it starts to iterate
 * @returns Y axis position
 */
function findOpaqueVertical(
  imageData: ImageData,
  from: number,
): number {
  let start: number;
  let end: number;
  let factor: number;
  let index: number;

  if (from === TOP) {
    start = 0;
    end = imageData.height;
    factor = 1;
  } else {
    start = imageData.height;
    end = 0;
    factor = -1;
  }

  for (start; start !== end; start += factor) {
    index = (start * imageData.width * 4);
    
    for (let x = 0; x < imageData.width; x ++) {
      if (imageData.data[index + (x * 4) + 3] > 0) {
        return start;
      }
    }
  }

  return end;
}

/**
 * 
 * @param canvas - A source canvas
 * @param from - Start side
 * @param to - End side
 * @returns A position on X or Y axis
 */
export function findOpaque(
  canvas: Canvas,
  from: number,
  to: number
): number {
  const data = canvas
    .getContext('2d')
    .getImageData(
      0, 0,
      canvas.width, canvas.height
    );

  switch (from | to) {
    case DIRECTION_HOZIRONTAL:
      return findOpaqueHorizontal(data, from);
    case DIRECTION_VERTICAL:
      return findOpaqueVertical(data, from);
    default:
      throw new AssetError('Unauthorize direction.')
  }
}

/**
 * Automatically find the smallest rectangle fitting with the image.
 * @param oldCanvas - A source canvas
 * @returns - A new canvas
 */
export function autoCropCanvas(oldCanvas: Canvas): Canvas {
  const x1 = findOpaque(oldCanvas, LEFT, RIGHT);
  const x2 = findOpaque(oldCanvas, RIGHT, LEFT);
  const y1 = findOpaque(oldCanvas, TOP, DOWN);
  const y2 = findOpaque(oldCanvas, DOWN, TOP);

  const [w, h] = [x2 - x1, y2 - y1];
  const canvas = createCanvas(w, h);
  
  canvas
    .getContext('2d')
    .drawImage(
      oldCanvas,
      x1, y1,
      w, h,
      0, 0,
      w, h
    );

  return canvas;
}

/**
 * Global variable for the canvas cache;
 */
let cacheCanvas = new Cache<Canvas>;

export { cacheCanvas };

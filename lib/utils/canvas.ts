import { Image, Canvas, createCanvas, loadImage, ImageData, CanvasRenderingContext2D } from 'canvas';
import { FileError } from '../error';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import Cache from '../cache';

/**
 * The function draws a rounded rectangle on a canvas with a specified radius,
 * width, height, and color.
 * @param {CanvasRenderingContext2D} ctx - CanvasRenderingContext2D is the context
 * of the canvas element on which the rounded rectangle will be drawn.
 * @param {number} r - The radius of the rounded corners of the rectangle.
 * @param {number} w - The width of the rounded rectangle.
 * @param {number} h - The height of the rounded rectangle.
 * @param {string} color - The color parameter is a string that represents the fill
 * color of the rounded rectangle. It can be any valid CSS color value, such as
 * "red", "#00ff00", "rgb(255, 0, 0)", etc.
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
 * @param {CanvasRenderingContext2D} ctx - The CanvasRenderingContext2D object that
 * represents the canvas context on which the rounded image will be drawn.
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
 * @returns a Promise that resolves to a Canvas object.
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
 * @param {Canvas} canvas - The `canvas` parameter is an object that represents an
 * HTML canvas element. It can be used to draw graphics and images using
 * JavaScript. In this case, the `canvas` object is being used to generate a PNG
 * image that will be saved to a file.
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
 * @param {ImageData} imageData - The `imageData` parameter is an object of type
 * `ImageData` which represents the pixel data of an image. It contains information
 * about the width, height, and color values of each pixel in the image. This
 * function takes this `ImageData` object and creates a new canvas element with the
 * same dimensions
 * @returns a canvas element that has been created from the provided ImageData
 * object. The canvas element contains a 2D rendering context that has the
 * ImageData object drawn onto it using the putImageData() method.
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
 * This TypeScript function clones a given canvas element by creating a new canvas
 * with the same dimensions and drawing the original canvas onto it.
 * @param {Canvas} oldCanvas - The oldCanvas parameter is a Canvas object that
 * represents the canvas element that needs to be cloned.
 * @returns A new canvas element with the same dimensions and content as the input
 * `oldCanvas`.
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
 * Global variable for the canvas cache;
 */
let cacheCanvas = new Cache<Canvas>;

export { cacheCanvas };

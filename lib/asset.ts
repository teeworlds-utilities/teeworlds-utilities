import * as data from './data';
import {FileError, AssetError, ElementError} from './error';
import {saveInDir} from './utils/canvas';
import {ColorOperations, COLOR_FORMAT, ColorRGBA} from './color';

import {
  loadImage,
  createCanvas,
  ImageData,
  Canvas,
  CanvasRenderingContext2D,
  Image,
} from 'canvas';

// Needs ths JS version
const convert = require('color-convert');

type ColorValues = [number, number, number];

class TwElement {
  name: string;
  imgData: ImageData;
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;

  constructor(name: string, imgData: ImageData) {
    this.name = name;
    this.imgData = imgData;
    this.canvas = createCanvas(imgData.width, imgData.height);
    this.ctx = this.canvas.getContext('2d');
  }

  setColor(color: ColorRGBA, mode: ColorOperations) {
    const buffer = this.imgData.data;

    // Apply color on every pixel of the img
    for (let byte = 0; byte < buffer.length; byte += 4) {
      // Get pixel
      const r = buffer[byte];
      const g = buffer[byte + 1];
      const b = buffer[byte + 2];
      const a = buffer[byte + 3];

      // Overwriting the pixel
      const pixel = new ColorRGBA(r, g, b, a);
      pixel[mode](color);

      // Replace the pixel in the buffer
      buffer[byte] = pixel.r;
      buffer[byte + 1] = pixel.g;
      buffer[byte + 2] = pixel.b;
      buffer[byte + 3] = pixel.a;
    }

    this.setCanvas();
  }

  reorderBody() {
    // For the tee body
    // Reorder that the average grey is 192,192,192
    // https://github.com/ddnet/ddnet/blob/master/src/game/client/components/skins.cpp#L227-L263

    let orgWeight = 0;
    const frequencies = Array(256).fill(0);
    const newWeight = 192;
    const invOrgWeight = 255 - orgWeight;
    const invNewWeight = 255 - newWeight;
    const buffer = this.imgData.data;

    // Find the most common frequence
    for (let byte = 0; byte < buffer.length; byte += 4) {
      if (buffer[byte + 3] > 128) {
        frequencies[buffer[byte]]++;
      }
    }

    for (let i = 1; i < 256; i++) {
      if (frequencies[orgWeight] < frequencies[i]) {
        orgWeight = i;
      }
    }

    for (let byte = 0; byte < buffer.length; byte += 4) {
      let value = buffer[byte];

      if (value <= orgWeight && orgWeight === 0) {
        continue;
      } else if (value <= orgWeight) {
        value = Math.trunc((value / orgWeight) * newWeight);
      } else if (invOrgWeight === 0) {
        value = newWeight;
      } else {
        value = Math.trunc(
          ((value - orgWeight) / invOrgWeight) * invNewWeight + newWeight
        );
      }

      buffer[byte] = value;
      buffer[byte + 1] = value;
      buffer[byte + 2] = value;
    }
  }

  setCanvas() {
    this.ctx.putImageData(this.imgData, 0, 0);
  }

  save(dirname: string) {
    saveInDir(dirname, this.name + '.png', this.canvas);
  }
}

class TwAssetBase {
  type: string;
  path: string;
  elements: {
    [key: string]: TwElement;
  };
  data: {
    [key: string]: any;
  };

  img!: Image;
  rCanvas!: Canvas;
  canvas!: Canvas;
  ctx!: CanvasRenderingContext2D;

  constructor(type: string, path: string) {
    this.type = type.toUpperCase();
    this.path = path;
    this.elements = {};
    this.data = {};
  }

  async changeSrc(filename: string) {
    this.path = filename;
    await this.preprocess();
  }

  async preprocess(validRatio = true) {
    // Check the asset type
    if (Object.keys(data).includes(this.type) === false) {
      throw new AssetError('Invalid asset type ' + this.type);
    }
    const type = this.type as keyof typeof data;
    this.data = data[type];

    // Load image
    try {
      this.img = await loadImage(this.path);
    } catch (err) {
      throw new FileError('Unable to get the image ' + this.path);
    }

    // Check the image size
    if (this.isRatioLegal() === false && validRatio) {
      throw new FileError('Wrong image ratio ' + this.path);
    }

    // If everything is OK, it creates the canvas and the context
    this.canvas = createCanvas(this.img.width, this.img.height);
    this.ctx = this.canvas.getContext('2d');
    this.ctx.drawImage(this.img, 0, 0);
  }

  private isRatioLegal(): boolean {
    let ret = true;

    ret &&= this.img.width % this.data.divisor.w === 0;
    ret &&= this.img.height % this.data.divisor.h === 0;

    return ret;
  }

  getMultiplier(): number {
    return this.img.width / this.data.size.w;
  }

  private isCut(name: string): boolean {
    return Object.keys(this.elements).includes(name);
  }

  private cut(name: string): TwElement {
    if (Object.keys(this.data.elements).includes(name) === false) {
      throw new ElementError('Unauthorized element type ' + name);
    }

    if (this.isCut(name)) {
      return this.elements[name];
    }

    const m = this.getMultiplier();
    const d = this.data.elements[name].map((x: number) => x * m);
    const imgData = this.ctx.getImageData(d[0], d[1], d[2], d[3]);

    // Generate an object with the cut area data
    const element = new TwElement(name, imgData);
    element.setCanvas();

    return element;
  }

  extract(...names: string[]): this {
    for (const name of names) {
      const element = this.cut(name);
      this.elements[name] = element;
    }

    return this;
  }

  extractAll(): this {
    for (const name of Object.keys(this.data.elements)) {
      const element = this.cut(name);
      this.elements[name] = element;
    }

    return this;
  }

  private getColorArg(
    color: string,
    standard: keyof typeof COLOR_FORMAT
  ): ColorValues {
    const ret = COLOR_FORMAT[standard](color);

    return ret as ColorValues;
  }

  // Only handling HSL format
  private colorLimitForSkin(color: number[], limit = 52.5): ColorValues {
    if (color[2] < limit) {
      color[2] = limit;
    }

    return color as ColorValues;
  }

  private colorConvert(
    color: string,
    standard: keyof typeof COLOR_FORMAT
  ): ColorRGBA {
    let colorValues = this.getColorArg(color, standard);
    let rgbFormat: ColorValues;

    if (standard === 'rgb') {
      rgbFormat = colorValues;
      colorValues = convert.rgb.hsl(...colorValues);
    } else {
      rgbFormat = convert.hsl.rgb(...colorValues);
    }
    if (this.type !== 'SKIN') {
      return new ColorRGBA(...rgbFormat);
    }

    // Preventing full black or full white skins
    colorValues = this.colorLimitForSkin(colorValues);

    // Convert to RGB to apply the color
    colorValues = convert.hsl.rgb(...colorValues);
    return new ColorRGBA(...colorValues);
  }

  setColor(
    color: string,
    standard: keyof typeof COLOR_FORMAT,
    ...names: string[]
  ): this {
    const c = this.colorConvert(color, standard);

    for (const name of names) {
      if (Object.keys(this.elements).includes(name) === false)
        throw new ElementError('Element has never been extracted ' + name);

      this.elements[name].setColor(c, 'blackAndWhite');

      if (name === 'body') {
        this.elements[name].reorderBody();
      }

      this.elements[name].setColor(c, 'basicOperation');
    }

    return this;
  }

  setColorAll(color: string, standard: keyof typeof COLOR_FORMAT): this {
    this.setColor(color, standard, ...Object.keys(this.elements));

    return this;
  }

  render(eye?: string): this {
    if (this.type !== 'SKIN') {
      throw new AssetError("You can't render the asset " + this.type);
    }

    eye = eye || 'default_eye';
    this.extract('body', 'body_shadow', 'foot', 'foot_shadow', eye);

    let c: {
      width: number;
      height: number;
    };
    const m = this.getMultiplier();
    const rCanvas = createCanvas(
      this.elements['body'].canvas.width + 12 * m,
      this.elements['body'].canvas.height + 12 * m
    );
    const rCtx = rCanvas.getContext('2d');
    const cx = 6 * m;

    c = this.elements['foot_shadow'].canvas;
    rCtx.drawImage(
      c,
      0, 0, c.width, c.height,
      -cx + 2 * m, cx + 45 * m, c.width * 1.43, c.height * 1.45
    );

    c = this.elements['body_shadow'].canvas;
    rCtx.drawImage(
      c,
      0, 0, c.width, c.height,
      -cx + 12 * m, cx + 0 * m, c.width, c.height
    );

    
    c = this.elements['foot_shadow'].canvas;
    rCtx.drawImage(
      c,
      0, 0, c.width, c.height,
      -cx + 24 * m, cx + 45 * m, c.width * 1.43, c.height * 1.45
      );

    c = this.elements['foot'].canvas;
    rCtx.drawImage(
      c,
      0, 0, c.width, c.height,
      -cx + 2 * m, cx + 45 * m, c.width * 1.43, c.height * 1.45
    );

    c = this.elements['body'].canvas;
    rCtx.drawImage(
      c,
      0, 0, c.width, c.height,
      -cx + 12 * m, cx + 0 * m, c.width, c.height
    );

    c = this.elements['foot'].canvas;
    rCtx.drawImage(
      c,
      0, 0, c.width, c.height,
      -cx + 24 * m, cx + 45 * m, c.width * 1.43, c.height * 1.45
    );

    c = this.elements[eye].canvas;
    rCtx.drawImage(
      c,
      0, 0, c.width, c.height,
      -cx + 49.5 * m, cx + 23 * m, c.width * 1.15, c.height * 1.22
    );

    c = this.elements[eye].canvas;
    rCtx.save();
    rCtx.scale(-1, 1);
    rCtx.drawImage(
      c,
      0, 0, c.width, c.height,
      cx + -98 * m, cx + 23 * m, c.width * 1.15, c.height * 1.22
    );
    rCtx.restore();

    this.rCanvas = rCanvas;

    return this;
  }

  saveRender(dirname: string, name?: string): this {
    const filename = name || this.path.split('/').pop();
    if (!this.rCanvas) {
      throw new AssetError('The render canvas is undefined');
    }

    saveInDir(dirname, 'render_' + filename, this.rCanvas);

    return this;
  }

  async setHat(
    path: string,
    sx = 0,
    sy = 0,
    size = 128
  ): Promise<this> {
    const eKeys = Object.keys(this.elements);
    if (
      this.type !== 'SKIN' &&
      (!eKeys.includes('body') || !eKeys.includes('body_shadow'))
    ) {
      throw new AssetError(
        'Only available for skin and you must extract body and body_shadow'
      );
    }

    // The ideal size for a hat is the same as the one of the body,
    // it is also possible to make several frames in a single
    // image as data/xmas_hat.png

    const body = this.elements.body;
    const bodyS = this.elements.body_shadow;

    try {
      const hat = await loadImage(path);
      const m = body.canvas.width / size;

      // Add the hat
      body.ctx.drawImage(hat, sx, sy, size, size, 0, 0, size * m, size * m);
      const diff = (size * m * 1.05 - size * m) / 2;

      // Add the hat to the shadow
      bodyS.ctx.drawImage(
        hat,
        sx, sy, size, size,
        -diff - 0.5, -diff - 0.2, size * m * 1.05, size * m * 1.05
      );

      // Apply black color to the hat + shadow
      bodyS.ctx.globalCompositeOperation = 'source-atop';
      bodyS.ctx.fillStyle = 'black';
      bodyS.ctx.fillRect(0, 0, bodyS.canvas.width, bodyS.canvas.height);
    } catch (err) {
      throw new FileError('Unable to get the image ' + path);
    }

    return this;
  }
}

class TwAssetExtractor extends TwAssetBase {
  save(dirname: string): this {
    for (const element of Object.values(this.elements)) element.save(dirname);

    return this;
  }
}

export {TwAssetBase, TwAssetExtractor, TwElement};

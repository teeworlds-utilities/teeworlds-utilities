import {InvalidColor} from './error';
import {isDigit, genChunks} from './utils';

interface IColor {
  readonly from: number;
  readonly to: number;
  readonly average: number;

  isInRange: (value: number) => boolean;
  blackAndWhite: (color: this) => void;
  basicOperation: (color: this) => void;
};

class ColorRGBA implements IColor {
  r: number;
  g: number;
  b: number;
  a: number;

  private readonly _from = 0;
  private readonly _to = 255;

  constructor(
    r: number,
    g: number,
    b: number,
    a = 255
  ) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  get from() {
    return this._from;
  }

  get to() {
    return this._to;
  }

  get average(): number {
    return (this.r + this.g + this.b) / 3;
  }

  isInRange(value: number): boolean {
    return value >= this._from && value <= this._to;
  }

  blackAndWhite(_: ColorRGBA) {
    const average = this.average;
  
    this.r = average;
    this.g = average;
    this.b = average;
  }

  basicOperation(color: ColorRGBA) {
    this.r = (this.r * color.r) / this._to;
    this.g = (this.g * color.g) / this._to;
    this.b = (this.b * color.b) / this._to;
    this.a = (this.a * color.a) / this._to;
  }
}

function rgbFormat(color: string): number[] {
  const sColor: any = color.split(',');

  if (sColor.length < 3 || sColor.length > 4)
    throw new InvalidColor('Mininum and maximum elements: 3, 4');

  for (let i = 0; i < sColor.length; i++) {
    let value: any = sColor[i].match(/\d+/);

    if (!value)
      throw new InvalidColor(
        'Invalid RGB color format ' +
          color +
          '\nValid format: "255, 0, 12" or "255, 0, 12, 255"'
      );

    value = parseInt(value);

    if (value < 0 || value > 255)
      throw new InvalidColor(`RGB color ${value} is not between 0 and 255`);

    sColor[i] = value;
  }

  return sColor;
}

function hslFormat(color: string): number[] {
  const limits = [360, 100, 100, 255];
  const sColor: any = color.split(',');
  let limit: number;

  if (sColor.length < 3 || sColor.length > 4)
    throw new InvalidColor('Mininum and maximum elements: 3, 4');

  for (let i = 0; i < sColor.length; i++) {
    let value: any = sColor[i].match(/\d+/);

    if (!value)
      throw new InvalidColor(
        'Invalid HSL color format ' +
          color +
          '\nValid format: "360, 100, 100" or "123, 12, 12, 255"'
      );

    value = parseInt(value);
    limit = limits[i];
    if (value < 0 || value > limit)
      throw new InvalidColor(
        `RGB color ${value} is not between 0 and ${limit}`
      );
    sColor[i] = value;
  }
  return sColor;
}

// Convert a color code to HSL format
function codeFormat(color: string): number[] {
  if (isDigit(color) === false)
    throw new InvalidColor(
      'Invalid code format ' +
        color +
        '\nValid format: A value encoded on 6 bytes'
    );

  const colorLong: number = parseInt(color);

  if (colorLong < 0 || colorLong > 0xffffff)
    throw new InvalidColor(
      'Invalid value ' +
        color +
        '\nValid format: an integer (min: 0, max: 0xffffff)'
    );

  color = colorLong.toString(16);
  const l = color.length;

  if (l < 6) color = '0'.repeat(6 - l) + color;

  const chunks = genChunks(color, 2).map((x: string) => parseInt(x, 16));
  chunks[0] = (chunks[0] * 360) / 255;
  chunks[1] = (chunks[1] * 100) / 255;
  chunks[2] = ((chunks[2] / 2 + 128) * 100) / 255;

  return chunks;
}

const COLOR_FORMAT = {
  rgb: rgbFormat,
  hsl: hslFormat,
  code: codeFormat,
};

type ColorOperations = 
'basicOperation'
| 'blackAndWhite';

export {ColorOperations, COLOR_FORMAT, IColor, ColorRGBA};

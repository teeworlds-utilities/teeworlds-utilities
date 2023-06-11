import { ColorError } from './error';

import * as convert from 'color-convert';

interface IColorConvert {
  rgba: () => IColor;
  hsl: () => IColor;
  twCode: () => IColor;
}

export interface IColor extends IColorConvert {
  toArray: () => number[];
}


type HSL = [number, number, number];

/**
 * The function sets a color value within a specified range and throws an error if
 * the value is outside that range.
 * @param {number} value - a number representing the color value to be checked and
 * returned
 * @param {number} from - The minimum value that the color can have.
 * @param {number} to - The "to" parameter is a number representing the upper limit
 * of the color range. The function checks if the "value" parameter is within the
 * range of "from" and "to", and throws an error if it is not.
 * @returns the `value` parameter if it is within the range specified by the `from`
 * and `to` parameters. If the `value` parameter is outside of this range, the
 * function throws a `ColorError` with a message indicating the valid range.
 */
function setColorValueBase(
  value: number,
  from: number,
  to: number
): number {
  if (value < from || value > to) {
    throw new ColorError(
      'The color must be between ' + from.toString()
      + ' and ' + to.toString()
    );
  }

  return value;
}

/**
 * The function sets the color value of a given number within a specified range.
 * @param {number} value - The current value of the color component that needs to
 * be set.
 * @param {number} to - The "to" parameter is a number that represents the maximum
 * value that the "value" parameter can be set to. The function is designed to set
 * the "value" parameter to a value between 0 and "to".
 * @returns The function `setColorValue` is returning a number, which is the result
 * of calling the function `setColorValueBase` with the arguments `value`, `0`, and
 * `to`.
 */
function setColorValue(value: number, to: number): number {
  return setColorValueBase(value, 0, to);
}

export class ColorRGBA implements IColor {
  private _r: number;
  private _g: number;
  private _b: number;
  private _a: number;
  
  constructor(
    r: number,
    g: number,
    b: number,
    a: number
  ) {
    this._r = r
    this._g = g
    this._b = b
    this._a = a
  }

  set r(value: number) { this._r = setColorValue(value, 255); };
  set g(value: number) { this._g = setColorValue(value, 255); };
  set b(value: number) { this._b = setColorValue(value, 255); };
  set a(value: number) { this._a = setColorValue(value, 255); };

  get r(): number { return this._r; };
  get g(): number { return this._g; };
  get b(): number { return this._b; };
  get a(): number { return this._a; };

  toArray(): number[] {
    return [this._r, this._g, this._b, this._a]
  }

  rgba(): IColor {
    return this;
  }

  hsl(): IColor {
    const hsl = convert.rgb.hsl(
      this._r,
      this._g,
      this._b
    )
  
    return new ColorHSL(...hsl);
  }

  twCode(): IColor {
    throw new ColorError('Not implemented');
  }

  get average(): number {
    return (this.r + this.g + this.b) / 3;
  }

  /**
   * The function sets the red, green, and blue values of an image to their average
   * value, resulting in a black and white effect.
   * @returns The `this` object is being returned.
   */
  blackAndWhite(): this {
    const average = this.average;
  
    this._r = average;
    this._g = average;
    this._b = average;
  
    return this
  }

  /**
   * The function applies a color to an object by adjusting its RGBA values based
   * on the input color.
   * @param {ColorRGBA} color - ColorRGBA is a data type that represents a color in
   * the RGBA color space. It consists of four components: red (r), green (g), blue
   * (b), and alpha (a) values, each ranging from 0 to 255. The "color" parameter
   * in the "applyColor
   * @returns the updated object with the new color values.
   */
  applyColor(color: ColorRGBA) {
    this.r = (this._r * color.r) / 255;
    this.g = (this._g * color.g) / 255;
    this.b = (this._b * color.b) / 255;
    this.a = (this._a * color.a) / 255;
    
    return this
  }
}

export class ColorRGB extends ColorRGBA implements IColor{
  constructor(r: number, g: number, b: number) {
    super(r, g, b, 255)
  }
}

export class ColorHSL implements IColor {
  private _h: number;
  private _s: number;
  private _l: number;

  constructor(h: number, s: number, l: number) {
    this.h = h;
    this.s = s;
    this.l = l;
  }

  set h(value: number) { this._h = setColorValue(value, 360); };
  set s(value: number) { this._s = setColorValue(value, 100); };
  set l(value: number) { this._l = setColorValue(value, 100); };

  get h(): number { return this._h; };
  get s(): number { return this._s; };
  get l(): number { return this._l; };

  toArray(): HSL {
    return [this.h, this.s, this.l];
  }

  rgba(): IColor {
    return new ColorRGBA(
      ...convert.hsl.rgb(this.toArray()),
      255
    );
  }

  hsl(): IColor {
    return this;
  }

  /**
   * Upgrade
   * @returns 
   */
  twCode(): IColor {
    let code = (this._h * 0xff) / 360;

    code <<= 8;
    code |= (this._s * 0xff) / 100;
    code <<= 8;
    code |= ((this._l * 0xff) / 100 - 128) * 2;

    return new ColorCode(code);
  }
}

export class ColorCode implements IColor {
  readonly code: number;
  
  constructor(value: number) {
    this.code = setColorValue(value, 0xffffff);
  }

  toArray(): HSL {
    return [
      (this.code >> 16) & 0xff,
      (this.code >> 8) & 0xff,
      this.code & 0xff,
    ];
  }

  rgba(): IColor {
    return this
      .hsl()
      .rgba();
  }

  hsl(): IColor {
    let arr = this.toArray()

    // Adjusting HSL values for Teeworlds
    arr[0] = (arr.at(0) * 360) / 0xff;
    arr[1] = (arr.at(1) * 100) / 0xff;
    arr[2] = ((arr.at(2) / 2 + 128) * 100) / 0xff;

    return new ColorHSL(...arr);
  }

  twCode(): IColor {
    return this;
  }
}

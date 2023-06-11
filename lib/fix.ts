import {TwAssetBase} from './asset';
import {saveInDir} from './utils/canvas';
import { closestNumber } from './utils/util';

import {Canvas, createCanvas} from 'canvas';
import {AssetError} from './error';

class TwAssetFix extends TwAssetBase {
  private fixedWidth!: number;
  private fixedHeight!: number;

  fixedCanvas!: Canvas;

  constructor(type: string, src: string) {
    super(type, src);
  }

  async preprocess() {
    await super.preprocess(false);
  }

  private getFixedSize(): boolean {
    let ret = true;
    const divisorWidth = this.data.divisor.w;
    const divisorHeight = this.data.divisor.h;
    const ratio = divisorWidth / divisorHeight;

    this.fixedWidth = closestNumber(this.img.width, divisorWidth);
    this.fixedHeight = closestNumber(this.img.height, divisorHeight);

    this.fixedWidth = ratio * this.fixedHeight;

    ret &&= this.fixedWidth === this.img.width;
    ret &&= this.fixedHeight === this.img.height;

    return ret;
  }

  fix(): this {
    if (this.getFixedSize() === true)
      throw new AssetError(`Already have a good format ${this.path}`);

    this.fixedCanvas = createCanvas(this.fixedWidth, this.fixedHeight);
    const ctx = this.fixedCanvas.getContext('2d');

    ctx.clearRect(0, 0, this.fixedWidth, this.fixedHeight);
    ctx.drawImage(
      this.canvas,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
      0,
      0,
      this.fixedWidth,
      this.fixedHeight
    );

    return this;
  }

  save(dirname: string, name: string | undefined) {
    const filename = name || this.path.split('/').pop();

    saveInDir(dirname, filename as string, this.fixedCanvas);
  }
}

export {TwAssetFix};

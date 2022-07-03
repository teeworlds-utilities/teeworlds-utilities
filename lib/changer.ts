import {TwAssetBase} from './asset';
import {saveInDir} from './utils';
import {InvalidElement} from './error';

class TwAssetChanger extends TwAssetBase {
  dests: any[];

  constructor(type: string, src: string, ...dests: string[]) {
    super(type, src);
    this.dests = dests;
  }

  async preprocess() {
    // Preprocess the source image
    await super.preprocess();

    // Preprocess the destination images
    for (let i = 0; i < this.dests.length; i++) {
      this.dests[i] = new TwAssetBase(this.type, this.dests[i]);
      await this.dests[i].preprocess();
    }
  }

  change(...names: string[]): this {
    for (const name of names) {
      if (Object.keys(this.elements).includes(name) === false)
        throw new InvalidElement('Element has never been extracted ' + name);

      const d = this.data.elements[name];
      const element = this.elements[name];

      for (let i = 0; i < this.dests.length; i++) {
        // Multipliers
        const size_m = this.dests[i].img.width / this.img.width;
        const pos_m = this.dests[i].getMultiplier();

        // Source
        const sw = element.canvas.width;
        const sh = element.canvas.height;

        // Destination
        const dx = d[0] * pos_m;
        const dy = d[1] * pos_m;
        const dw = sw * size_m;
        const dh = sh * size_m;

        // Apply
        this.dests[i].ctx.clearRect(dx, dy, dw, dh);
        this.dests[i].ctx.drawImage(
          element.canvas,
          0, 0, sw, sh,
          dx, dy, dw, dh
        );
      }
    }

    return this;
  }

  save(dirname: string, name: string | undefined): this {
    for (const dest of this.dests) {
      const filename = name || dest.path.split('/').pop();
      saveInDir(dirname, filename, dest.canvas);
    }

    return this;
  }
}

export {TwAssetChanger};

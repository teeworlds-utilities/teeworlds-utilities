import { Canvas, createCanvas, CanvasRenderingContext2D } from "canvas";
import { Asset } from "./base";
import { AssetKind, EyeSkinPart, IAssetPartMetadata, SkinPart } from "./part";
import { canvasFromImageData, cloneCanvas, saveCanvas } from "../utils/canvas";
import { ColorHSL, IColor } from "../color";

const SKIN_METADATA = {
  baseSize: {w: 256, h: 128},
  divisor: {w: 8, h: 4},
  kind: AssetKind.SKIN,
}

const BODY_LIMIT = 52.5;

export default class Skin extends Asset<SkinPart> {
  private _renderCanvas: Canvas;
  private renderCtx: CanvasRenderingContext2D;

  constructor() {
    super(SKIN_METADATA);
  }

  /**
   * The function returns a cloned canvas object.
   * @returns The `renderCanvas` property is being returned, which is of type
   * `Canvas`. The value being returned is a cloned copy of the `_renderCanvas`
   * property.
   */
  get renderCanvas(): Canvas {
    return cloneCanvas(this._renderCanvas);
  }

  loadFromCanvas(canvas: Canvas): this {
    super.loadFromCanvas(canvas);

    const bodyMetadata = this._getPartMetadata(SkinPart.BODY);

    this._renderCanvas = createCanvas(
      (bodyMetadata.w + 12) * this.multiplier,
      (bodyMetadata.h + 12) * this.multiplier,
    );
    this.renderCtx = this._renderCanvas.getContext('2d');

    return this;
  }

  private getCanvasFromPart(assetPart: SkinPart): Canvas {
    const partMetadata = this.getPartMetadata(assetPart);
    const imageData = this.ctx.getImageData(
      partMetadata.x,
      partMetadata.y,
      partMetadata.w,
      partMetadata.h,
    );

    return canvasFromImageData(imageData);
  }

  colorPart(color: IColor, assetPart: SkinPart): this {
    let hsl = color.hsl() as ColorHSL;

    if (hsl.l < BODY_LIMIT) {
      hsl.l = BODY_LIMIT;
    }

    if (assetPart === SkinPart.BODY) {
      this.reorderBody();
    }

    return super.colorPart(hsl, assetPart);
  }

  private reorderBody() {
    // For the tee body
    // Reorder that the average grey is 192,192,192
    // https://github.com/ddnet/ddnet/blob/master/src/game/client/components/skins.cpp#L227-L263

    const partMetadata = this.getPartMetadata(SkinPart.BODY);

    let orgWeight = 0;
    const frequencies = Array(256).fill(0);
    const newWeight = 192;
    const invOrgWeight = 255 - orgWeight;
    const invNewWeight = 255 - newWeight;

    let imageData = this.ctx.getImageData(
      partMetadata.x,
      partMetadata.y,
      partMetadata.w,
      partMetadata.h
    );

    let buffer = imageData.data;

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

    this.ctx.clearRect(
      partMetadata.x,
      partMetadata.y,
      partMetadata.w,
      partMetadata.h,
    );

    this.ctx.putImageData(
      imageData,
      partMetadata.x,
      partMetadata.y
    )
  }

  private drawPart(canvas: Canvas, metadata: IAssetPartMetadata): this {
    this.renderCtx.drawImage(
      canvas,
      0, 0,
      canvas.width, canvas.height,
      metadata.x, metadata.y,
      metadata.w, metadata.h
    );

    return this;
  }

  render(eyeAssetPart: EyeSkinPart = SkinPart.DEFAULT_EYE): this {
    const multiplier = this.multiplier;
    const cx = 6 * multiplier;

    const footShadow = this.getCanvasFromPart(SkinPart.FOOT_SHADOW);
    const foot = this.getCanvasFromPart(SkinPart.FOOT);
    const bodyShadow = this.getCanvasFromPart(SkinPart.BODY_SHADOW);
    const body = this.getCanvasFromPart(SkinPart.BODY);
    const eye = this.getCanvasFromPart(eyeAssetPart);

    this.drawPart(
      footShadow,
      {
        x: -cx + 2 * multiplier,
        y: cx + 45 * multiplier,
        w: footShadow.width * 1.43,
        h: footShadow.height * 1.45
      }
    )
    .drawPart(
      bodyShadow,
      {
        x: -cx + 12 * multiplier,
        y: cx + 0 * multiplier,
        w: bodyShadow.width,
        h: bodyShadow.height
      }
    )
    .drawPart(
      footShadow,
      {
        x: -cx + 24 * multiplier,
        y: cx + 45 * multiplier,
        w: footShadow.width * 1.43,
        h: footShadow.height * 1.45
      }
    )
    .drawPart(
      foot,
      {
        x: -cx + 2 * multiplier,
        y: cx + 45 * multiplier,
        w: foot.width * 1.43,
        h: foot.height * 1.45
      }
    )
    .drawPart(
      body,
      {
        x: -cx + 12 * multiplier,
        y: cx + 0 * multiplier,
        w: body.width,
        h: body.height 
      }
    )
    .drawPart(
      foot,
      {
        x: -cx + 24 * multiplier,
        y: cx + 45 * multiplier,
        w: foot.width * 1.43,
        h: foot.height * 1.45
      }
    )
    .drawPart(
      eye,
      {
        x: -cx + 49.54 * multiplier,
        y: cx + 23 * multiplier,
        w: eye.width * 1.15,
        h: eye.height * 1.22
      }
    )

    this.renderCtx.save();
    this.renderCtx.scale(-1, 1);

    this.drawPart(
      eye,
      {
        x: cx + -98 * multiplier,
        y: cx + 23 * multiplier,
        w: eye.width * 1.15,
        h: eye.height * 1.22
      }
    )

    this.renderCtx.restore();

    return this;
  }

  saveRender(): this {
    return this.saveRenderAs(this.metadata.name + '.png');
  }

  saveRenderAs(path: string): this {
    saveCanvas(
      'render_' + path,
      this._renderCanvas
    );

    return this;
  }
}

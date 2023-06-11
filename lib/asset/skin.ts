import { Canvas, createCanvas, CanvasRenderingContext2D } from "canvas";
import { Asset } from "./base";
import { AssetKind, EyeSkinPart, SkinPart } from "./part";
import { canvasFromImageData, saveCanvas } from "../utils/canvas";
import { ColorHSL, IColor } from "../color";

const SKIN_METADATA = {
  baseSize: {w: 256, h: 128},
  divisor: {w: 8, h: 4},
  kind: AssetKind.SKIN,
}

const BODY_LIMIT = 52.5;

export default class Skin extends Asset<SkinPart> {
  private renderCanvas: Canvas;
  private renderCtx: CanvasRenderingContext2D;

  constructor() {
    super(SKIN_METADATA);
  }

  loadFromCanvas(canvas: Canvas): this {
    super.loadFromCanvas(canvas);

    const bodyMetadata = this._getPartMetadata(SkinPart.BODY);

    this.renderCanvas = createCanvas(
      (bodyMetadata.w + 12) * this.multiplier,
      (bodyMetadata.h + 12) * this.multiplier,
    );
    this.renderCtx = this.renderCanvas.getContext('2d');

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

    if (hsl.l > BODY_LIMIT) {
      hsl.l = BODY_LIMIT;
    }

    if (assetPart === SkinPart.BODY) {
      this.reorderBody();
    }

    return super.colorPart(hsl, assetPart);
  }

  reorderBody(assetPart?: SkinPart) {
    // For the tee body
    // Reorder that the average grey is 192,192,192
    // https://github.com/ddnet/ddnet/blob/master/src/game/client/components/skins.cpp#L227-L263

    const part = assetPart || SkinPart.BODY;
    const partMetadata = this.getPartMetadata(part);

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

    this.ctx.putImageData(
      imageData,
      partMetadata.x,
      partMetadata.y
    )
  }

  render(eyeAssetPart: EyeSkinPart = SkinPart.DEFAULT_EYE): this {
    const multiplier = this.multiplier;
    const cx = 6 * this.multiplier;

    const footShadow = this.getCanvasFromPart(SkinPart.FOOT_SHADOW);
    const foot = this.getCanvasFromPart(SkinPart.FOOT);
    const bodyShadow = this.getCanvasFromPart(SkinPart.BODY_SHADOW);
    const body = this.getCanvasFromPart(SkinPart.BODY);
    const eye = this.getCanvasFromPart(eyeAssetPart);

    this.renderCtx.drawImage(
      footShadow,
      0, 0,
      footShadow.width,
      footShadow.height,
      -cx + 2 * multiplier, cx + 45 * multiplier,
      footShadow.width * 1.43, footShadow.height * 1.45
    );

    this.renderCtx.drawImage(
      bodyShadow,
      0, 0,
      bodyShadow.width, bodyShadow.height,
      -cx + 12 * multiplier, cx + 0 * multiplier,
      bodyShadow.width, bodyShadow.height
    );

    this.renderCtx.drawImage(
      footShadow,
      0, 0,
      footShadow.width, footShadow.height,
      -cx + 24 * multiplier, cx + 45 * multiplier,
      footShadow.width * 1.43, footShadow.height * 1.45
    );

    this.renderCtx.drawImage(
      foot,
      0, 0,
      foot.width, foot.height,
      -cx + 2 * multiplier, cx + 45 * multiplier,
      foot.width * 1.43, foot.height * 1.45
    );

    this.renderCtx.drawImage(
      body,
      0, 0,
      body.width, body.height,
      -cx + 12 * multiplier, cx + 0 * multiplier,
      body.width, body.height
    );

    this.renderCtx.drawImage(
      foot,
      0, 0,
      foot.width, foot.height,
      -cx + 24 * multiplier, cx + 45 * multiplier,
      foot.width * 1.43, foot.height * 1.45
    );

    this.renderCtx.drawImage(
      eye,
      0, 0,
      eye.width, eye.height,
      -cx + 49.5 * multiplier, cx + 23 * multiplier,
      eye.width * 1.15, eye.height * 1.22
    );

    this.renderCtx.save();
    this.renderCtx.scale(-1, 1);

    this.renderCtx.drawImage(
      eye,
      0, 0,
      eye.width, eye.height,
      cx + -98 * multiplier, cx + 23 * multiplier,
      eye.width * 1.15, eye.height * 1.22
    );

    this.renderCtx.restore();

    return this;
  }

  saveRender(): this {
    return this.saveRenderAs(this.metadata.name + '.png');
  }

  saveRenderAs(path: string): this {
    saveCanvas(
      'render_' + path,
      this.renderCanvas
    );

    return this;
  }
}

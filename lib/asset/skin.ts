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
  renderCanvas: Canvas;
  private renderCtx: CanvasRenderingContext2D;
  private eyeAssetPart: EyeSkinPart;

  constructor() {
    super(SKIN_METADATA);

    this.eyeAssetPart = SkinPart.DEFAULT_EYE;
  }

  /**
   * This function sets the eye asset part and returns the object.
   * @param {EyeSkinPart} value - EyeSkinPart - a type of object representing a
   * part of an eye skin asset.
   * @returns The method `setEyeAssetPart` is returning `this`, which refers to the
   * current object instance. This is commonly used in method chaining, where
   * multiple methods can be called on the same object instance in a single line of
   * code.
   */
  setEyeAssetPart(value: EyeSkinPart): this {
    this.eyeAssetPart = value;

    return this;
  }

  /**
   * The function returns a cloned canvas object.
   * @returns The `cloneRenderCanvas` property is being returned, which is of type
   * `Canvas`. The value being returned is a cloned copy of the `renderCanvas`
   * property.
   */
  get cloneRenderCanvas(): Canvas {
    return cloneCanvas(this.renderCanvas);
  }

  /**
   * The `loadFromCanvas` method is loading the skin asset from a canvas object. It
   * calls the `loadFromCanvas` method of the parent class `Asset` to load the
   * metadata of the asset parts from the canvas. It then creates a new canvas
   * object `renderCanvas` with a size that is calculated based on the size of the
   * body part metadata and the `multiplier` property of the class. It also creates
   * a new 2D rendering context `renderCtx` for the `renderCanvas`. Finally, it
   * returns the current object instance.
   */
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

  /**
   * This function retrieves a canvas from a specific part of an image.
   * @param {SkinPart} assetPart - The parameter `assetPart` is of type `SkinPart`,
   * which is likely an object representing a specific part of a character's skin
   * in a video game or other digital application. It is used to retrieve metadata
   * about the part's position and dimensions on a larger canvas, which is then
   * used to extract
   * @returns a Canvas object.
   */
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

  /**
   * This function sets the color of a specific part of a skin and ensures that the
   * body part is reordered if necessary.
   * @param {IColor} color - The color parameter is of type IColor, which
   * represents a color value. It is used to set the color of a specific asset
   * part.
   * @param {SkinPart} assetPart - `assetPart` is a parameter of type `SkinPart`
   * which represents the specific part of a character's skin that is being
   * colored. It could be the body, head, arms, legs, etc.
   * @returns the result of calling the `super.colorPart()` method with the `hsl`
   * and `assetPart` arguments.
   */
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

  /**
   * The function sets the color of the body part of a skin using the provided
   * color object.
   * @param {IColor} color - The color parameter is of type IColor, which is likely
   * an interface or a class representing a color value. It is used to set the
   * color of a specific part of a skin, in this case the body part.
   * @returns The `colorBody` method is returning `this`, which refers to the
   * current instance of the class.
   */
  colorBody(color: IColor): this {
    return this.colorParts(
      color,
      SkinPart.BODY,
      this.eyeAssetPart
    );
  }

  /**
   * The function sets the color of the body and feet of an object.
   * @param {IColor} bodyColor - The parameter `bodyColor` is of type `IColor` and
   * represents the color that will be applied to the body part of an object.
   * @param {IColor} footColor - The `footColor` parameter is of type `IColor` and
   * represents the color that will be applied to the foot part of a character's
   * skin.
   * @returns The `colorTee` method is returning `this`, which refers to the
   * current instance of the object. This allows for method chaining, where
   * multiple methods can be called on the same object in a single line of code.
   */
  colorTee(bodyColor: IColor, footColor: IColor): this {
    return this
      .colorBody(bodyColor)
      .colorPart(footColor, SkinPart.FOOT);
  }

  /**
   * This function reorders the body of a skin image so that the average grey is
   * 192,192,192.
   * 
   * https://github.com/ddnet/ddnet/blob/master/src/game/client/components/skins.cpp#L227-L263
   */
  private reorderBody() {
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

  /**
   * This function draws a part of an asset onto a canvas using the provided
   * metadata.
   * @param {Canvas} canvas - The canvas parameter is an HTMLCanvasElement object
   * that represents the source image that will be drawn onto the canvas.
   * @param {IAssetPartMetadata} metadata - IAssetPartMetadata is an interface that
   * contains information about a specific part of an asset, such as its position
   * (x and y coordinates), width (w) and height (h). The drawPart function takes a
   * canvas element and the metadata for a specific part of an asset and draws that
   * part onto
   * @returns the current instance of the class (`this`) after drawing a part of an
   * asset onto the canvas.
   */
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

  /**
   * This function renders a tee's body parts and eyes onto a canvas.
   * @param {EyeSkinPart} [eyeAssetPart] - The `eyeAssetPart` parameter is an
   * optional parameter of type `EyeSkinPart` that represents the specific eye
   * asset to be rendered on the character. If no value is provided, it defaults to
   * the `eyeAssetPart` property of the object.
   * @returns the current instance of the class (`this`).
   */
  render(eyeAssetPart?: EyeSkinPart): this {
    const multiplier = this.multiplier;
    const cx = 6 * multiplier;

    const footShadow = this.getCanvasFromPart(SkinPart.FOOT_SHADOW);
    const foot = this.getCanvasFromPart(SkinPart.FOOT);
    const bodyShadow = this.getCanvasFromPart(SkinPart.BODY_SHADOW);
    const body = this.getCanvasFromPart(SkinPart.BODY);
    const eye = this.getCanvasFromPart(eyeAssetPart || this.eyeAssetPart);

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

  /**
   * The function saves the current render as a PNG file with the name of the
   * metadata.
   * @returns The `saveRender()` method is returning the result of calling the
   * `saveRenderAs()` method with the argument of the metadata name property
   * concatenated with the string '.png'.
   */
  saveRender(): this {
    return this.saveRenderAs(this.metadata.name + '.png');
  }

  /**
   * This function saves a canvas as an image file with a given path and returns
   * the object it was called on.
   * @param {string} path - A string representing the file path where the rendered
   * canvas should be saved.
   * @returns The function `saveRenderAs` is returning `this`, which refers to the
   * current object instance.
   */
  saveRenderAs(path: string): this {
    saveCanvas(
      'render_' + path,
      this.renderCanvas
    );

    return this;
  }
}

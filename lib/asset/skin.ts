import {
  Canvas,
  createCanvas,
  CanvasRenderingContext2D
} from "canvas";

import {
  Asset,
  MinimalAsset,
  Position
} from "./base";

import {
  AssetHelpSize,
  AssetKind,
  EyeSkinPart,
  GameskinPart,
  IAssetPartMetadata,
  ITeeWeaponMetadata,
  SkinPart,
  TEE_WEAPON_METADATA,
  WeaponGameSkinPart
} from "./part";

import {
  cloneCanvas,
  saveCanvas,
  canvasFlip,
  scaleCanvas,
  rotateCanvas,
  autoCropCanvas
} from "../utils/canvas";

import { ColorHSL, IColor } from "../color";
import Gameskin from "./gameskin";
import { AssetError } from "../error";
import { positionFromAngle } from "../utils/util";

const BODY_LIMIT = 52.5;

export default class Skin extends Asset<SkinPart> {
  renderCanvas: Canvas;
  private renderCtx: CanvasRenderingContext2D;
  private eyeAssetPart: EyeSkinPart;
  private _orientation: number;

  constructor() {
    super(
      {
        baseSize: {w: 256, h: 128},
        divisor: {w: 8, h: 4},
        kind: AssetKind.SKIN,
      }
    );

    this._orientation = 0;
    this.eyeAssetPart = SkinPart.DEFAULT_EYE;
  }

  /**
   * This function sets the eye asset part.
   * @param {EyeSkinPart} value - EyeSkinPart - a type of object representing a
   * part of an eye skin asset.
   * @returns this
   */
  setEyeAssetPart(value: EyeSkinPart): this {
    this.eyeAssetPart = value;

    return this;
  }

  /**
   * Gets orientation
   */
  get orientation(): number {
    return this._orientation;
  }

  /**
   * Defines the direction in which the tee looks
   * @param value - Angle
   * @returns this
   */
  setOrientation(value: number): this {
    if (value < 0 || value > 360) {
      throw new AssetError("Invalid angle.");
    }

    this._orientation = value;
    
    return this;
  }

  /**
   * Get the real eye position on the tee
   * @param x 
   * @param y 
   * @returns A position
   */
  private getEyePosition(x: number, y: number): Position {
    return positionFromAngle(
      {x: x, y: y},
      this._orientation,
      this.multiplier * 11
    );
  }

  /**
   * The function returns a cloned canvas object.
   */
  get cloneRenderCanvas(): Canvas {
    return cloneCanvas(this.renderCanvas);
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

  colorPart(color: IColor, assetPart: SkinPart): this {
    let hsl = color.hsl() as ColorHSL;

    if (hsl.l < BODY_LIMIT) {
      hsl.l = BODY_LIMIT;
    }

    this._colorPart(
      color,
      assetPart,
      (rgba, _) => rgba.blackAndWhite()
    );

    if (assetPart === SkinPart.BODY) {
      this.reorderBody();
    }

    return super.colorPart(hsl, assetPart);
  }

  /**
   * Applies `color` on the tee body, hand and its eyes.
   * @param {IColor} color - Color
   * @returns this
   */
  colorBody(color: IColor): this {
    return this.colorParts(
      color,
      SkinPart.BODY,
      SkinPart.HAND,
      this.eyeAssetPart
    );
  }

  /**
   * The function sets the color of the body and feet of an object.
   * @param {IColor} bodyColor - Body color
   * @param {IColor} footColor - Foot color
   * @returns this
   */
  colorTee(bodyColor: IColor, footColor: IColor): this {
    return this
      .colorBody(bodyColor)
      .colorParts(footColor, SkinPart.FOOT);
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
   * @param {Canvas} canvas - Canvas
   * @param {IAssetPartMetadata} metadata - Asset part metadata
   * @returns this
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
   * This function renders a tee.
   * @param {EyeSkinPart} [eyeAssetPart] - Skin part, must be a eye kind
   * @returns this
   */
  render(eyeAssetPart?: EyeSkinPart): this {
    this.renderCtx.clearRect(
      0, 0,
      this.renderCanvas.width,
      this.renderCanvas.height
    );

    const multiplier = this.multiplier;
    const cx = 6 * multiplier;

    const footShadow = this.getPartCanvas(SkinPart.FOOT_SHADOW);
    const foot = this.getPartCanvas(SkinPart.FOOT);
    const bodyShadow = this.getPartCanvas(SkinPart.BODY_SHADOW);
    const body = this.getPartCanvas(SkinPart.BODY);
    const eye = this.getPartCanvas(eyeAssetPart || this.eyeAssetPart);

    const eyePosition = this.getEyePosition(
      -cx + 42 * multiplier, // Body center origin on X axis
      cx + 23 * multiplier // Body center origin on Y axis
    );

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
      eye,
      {
        x: eyePosition.x - (5.5 * multiplier),
        y: eyePosition.y,
        w: eye.width * 1.15,
        h: eye.height * 1.22
      }
    )
    .drawPart(
      canvasFlip(eye, true),
      {
        x: eyePosition.x + (5.5 * multiplier),
        y: eyePosition.y,
        w: eye.width * 1.15,
        h: eye.height * 1.22
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
    );

    return this;
  }

  /**
   * The function saves the current render as a PNG file with the name of the
   * metadata.
   * @returns this
   */
  saveRender(cropped: boolean = false): this {
    return this.saveRenderAs(
      this.metadata.name + '.png',
      cropped
    );
  }

  /**
   * This function saves a canvas as an image file with a given path and returns
   * the object it was called on.
   * @param {string} path - A string representing the file path where the rendered
   * canvas should be saved.
   * @returns this
   */
  saveRenderAs(path: string, cropped: boolean = false): this {
    const canvas = cropped  === true
      ? autoCropCanvas(this.renderCanvas)
      : this.renderCanvas;

    saveCanvas(
      'render_' + path,
      canvas
    );

    return this;
  }
}

export class SkinWeapon extends MinimalAsset {
  private skin: Skin;
  private gameskin: Gameskin;
  
  private weapon: WeaponGameSkinPart;
  private weaponMetadata: ITeeWeaponMetadata;
  
  constructor() {
    super(
      {
        baseSize: {w: 200, h: 200},
        divisor: {w: 1, h: 1},
        kind: AssetKind.UNKNOWN
      }
    );

    this.empty();
  }

  /**
   * Set a tee skin
   * @param value - A Skin object
   * @returns this
   */
  setSkin(value: Skin): this {
    this.skin = value.scale(AssetHelpSize.DEFAULT);

    return this;
  }

  /**
   * Set a gameskin
   * @param value - Gameskin
   * @returns this
   */
  setGameskin(value: Gameskin): this {
    this.gameskin = value.scale(AssetHelpSize.DEFAULT);

    return this;
  }

  /**
   * Set a weapon
   * @param value - Skin part, must be a weapon
   * @returns this
   */
  setWeapon(value: WeaponGameSkinPart): this {
    this.weapon = value;
    this.weaponMetadata = TEE_WEAPON_METADATA[value];

    return this;
  }

  /**
   * Put the tee hand on a weapon
   * @param weaponsCanvas - Weapon canvas
   * @returns this
   */
  private putHand(weaponsCanvas: Canvas): this {
    let handCanvas = this.skin.getPartCanvas(SkinPart.HAND);

    handCanvas = rotateCanvas(
      scaleCanvas(
        handCanvas,
        0.9
      ),
      this.weaponMetadata.hand.angle
    );

    // const handShadowCanvas = this.skin.getPartCanvas(SkinPart.HAND_SHADOW);

    const weaponsCtx = weaponsCanvas.getContext('2d');

    weaponsCtx.drawImage(
      handCanvas,
      this.weaponMetadata.hand.x,
      this.weaponMetadata.hand.y,
    );

    return this;
  }

  /**
   * Adjust the weapon position based on the tee body center.
   * @param origin - Origin position
   * @param orientation - Angle
   * @returns The new weapon position
   */
  private adjustWeaponPosition(
    origin: Position,
    orientation: number
  ): Position {
    let ret = positionFromAngle(
      origin,
      orientation,
      this.weaponMetadata.move.x * this.skin.multiplier
    );

    const side = orientation > 90 && orientation < 270 ? -1 : 1;
    
    ret = positionFromAngle(
      ret,
      orientation + (90 * side),
      this.weaponMetadata.move.y * this.skin.multiplier
    );

    return ret;
  }

  /**
   * Put the weapon on the rendered tee canvas
   * @param orientation - Angle
   * @returns this
   */
  private putWeapon(orientation: number): this {
    // Get the weapon
    let weaponCanvas = scaleCanvas(
      this.gameskin.getPartCanvas(this.weapon),
      this.weaponMetadata.scaleFactor
    );

    this.putHand(weaponCanvas)

    // Hammer special case
    const rotate = (orientation > 90
      && orientation < 270)
      ? this.weapon !== GameskinPart.HAMMER
      : this.weapon === GameskinPart.HAMMER;

    weaponCanvas = canvasFlip(
      weaponCanvas,
      false,
      rotate
    );

    // Rotate the weapon with the right angle
    weaponCanvas = rotateCanvas(
      weaponCanvas,
      orientation
    );

    let weaponPosition = this.adjustWeaponPosition(
      {
        x: (this.canvas.width - weaponCanvas.width) / 2 ,
        y: (this.canvas.height - weaponCanvas.height) / 2
      },
      orientation
    );

    // Draw the weapon
    this.ctx.drawImage(
      weaponCanvas,
      weaponPosition.x,
      weaponPosition.y,
    );

    return this;
  }

  /**
   * Creates a canvas with the rendered tee and its weapon.
   * @param orientation - Angle
   * @returns this
   */
  process(orientation?: number): this {
    // Clears the canvas by prenvetion,
    // it avois multiple weapon overlapping
    this.ctx.clearRect(
      0, 0,
      this.canvas.width,
      this.canvas.height
    );

    orientation = orientation || this.skin.orientation;
  
    if (this.weapon == GameskinPart.HAMMER) {
      orientation = (
        orientation > 90
        && orientation < 270
      )
      ? 300
      : 240;
    }

    this.putWeapon(orientation);

    this.skin.render();

    this.ctx.drawImage(
      this.skin.renderCanvas,
      (this.canvas.width - this.skin.renderCanvas.width) / 2,
      (this.canvas.height - this.skin.renderCanvas.height) / 2
    );
    
    return this;
  }
}

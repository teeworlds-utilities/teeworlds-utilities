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
  BLINK_SCALE,
  EmoticonPart,
  EyeSkinPart,
  GameskinPart,
  IAssetPartMetadata,
  ITeeWeaponMetadata,
  SkinPart,
  TEE_WEAPON_METADATA,
  WeaponGameSkinPart,
  getEyesFromEmoticon
} from "./part";

import {
  cloneCanvas,
  saveCanvas,
  canvasFlip,
  scaleCanvas,
  rotateCanvas,
  autoCropCanvas,
  rawScaleCanvas
} from "../utils/canvas";

import { ColorHSL, IColor } from "../color";
import Gameskin from "./gameskin";
import { AssetError } from "../error";
import { positionFromAngle } from "../utils/util";
import Emoticon from "./emoticon";

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
      SkinPart.BODY_SHADOW,
      SkinPart.HAND,
      SkinPart.HAND_SHADOW,
      SkinPart.DEFAULT_EYE,
      SkinPart.ANGRY_EYE,
      SkinPart.PAIN_EYE,
      SkinPart.CROSS_EYE,
      SkinPart.HAPPY_EYE,
      SkinPart.SCARY_EYE
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

    const eyePart = eyeAssetPart || this.eyeAssetPart;

    const footShadow = this.getPartCanvas(SkinPart.FOOT_SHADOW);
    const foot = this.getPartCanvas(SkinPart.FOOT);
    const bodyShadow = this.getPartCanvas(SkinPart.BODY_SHADOW);
    const body = this.getPartCanvas(SkinPart.BODY);
    let eye = this.getPartCanvas(eyePart);

    const eyePosition = this.getEyePosition(
      -cx + 42 * multiplier, // Body center origin on X axis
      cx + 23 * multiplier // Body center origin on Y axis
    );

      if (eyePart === SkinPart.BLINK_EYE) {
        eyePosition.y += (eye.height + (eye.height * BLINK_SCALE)) / 3;
        
        eye = rawScaleCanvas(eye, 1, BLINK_SCALE);
      }

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
      'render_' + this.metadata.name + '.png',
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
      path,
      canvas
    );

    return this;
  }
}

export class SkinFull extends MinimalAsset {
  private skin: Skin;
  private gameskin: Gameskin;
  private emoticon?: Emoticon;
  
  private weapon: WeaponGameSkinPart;
  private weaponMetadata: ITeeWeaponMetadata;
  private emoticonPart: EmoticonPart;
  
  constructor() {
    super(
      {
        baseSize: {w: 250, h: 250},
        divisor: {w: 1, h: 1},
        kind: AssetKind.UNKNOWN
      }
    );

    // Prevention default values
    //
    // Default weapon part
    this.setWeapon(GameskinPart.HAMMER); 
    // Default emoticon part
    this.emoticonPart = EmoticonPart.PART_1_1;

    this.emoticon = null;

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
   * Set a weapon
   * @param value - WeaponGameSkinPart
   * @returns this
   */
  setWeapon(value: WeaponGameSkinPart): this {
    this.weapon = value;
    this.weaponMetadata = TEE_WEAPON_METADATA[value];

    return this;
  }

  /**
   * Set a gameskin
   * @param value - Gameskin
   * @param part - WeaponGameSkinPart
   * @returns this
   */
  setGameskin(value: Gameskin, part?: WeaponGameSkinPart): this {
    this.gameskin = value.scale(AssetHelpSize.DEFAULT);
    
    if (part) {
      this.setWeapon(part)
    }

    return this;
  }

  /**
   * Set an emoticon
   * @param value - Emoticon, must be an emoticon
   * @param part - EmoticonPart optional
   * @returns this
   */
   setEmoticon(value: Emoticon, part?: EmoticonPart): this {
    this.emoticon = value.scale(AssetHelpSize.DEFAULT);

    if (part) {
      this.setEmoticonPart(part)
    }
    return this;
  }

  /**
   * Set an emoticon part
   * @param value - Emoticon part
   * @returns this
   */
   setEmoticonPart(value: EmoticonPart): this {
    this.emoticonPart = value;
    // Adapt the skin eyes with its emoticon
    this.skin.setEyeAssetPart(
      getEyesFromEmoticon(value)
    );

    return this;
  }

  resetEmoticon(): this {
    this.emoticon = null;
    
    this.skin.setEyeAssetPart(SkinPart.DEFAULT_EYE);

    return this;
  }

  /**
   * Put the tee hand on a weapon
   * @param weaponsCanvas - Weapon canvas
   * @returns this
   */
  private putHand(weaponsCanvas: Canvas): this {
    const weaponsCtx = weaponsCanvas.getContext('2d');
    const angle = this.weaponMetadata.hand.angle;

    let handShadowCanvas = this.skin.getPartCanvas(
      SkinPart.HAND_SHADOW
    );

    handShadowCanvas
      .getContext('2d')
      .drawImage(
        this.skin.getPartCanvas(SkinPart.HAND),
        0, 0
      );
      
    handShadowCanvas = rotateCanvas(
      scaleCanvas(
        handShadowCanvas,
        0.9
      ),
      angle
    );
  
    weaponsCtx.drawImage(
      handShadowCanvas,
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

    const size = this.weapon === GameskinPart.HAMMER
      ? Math.hypot(
        weaponCanvas.width,
        weaponCanvas.height
      )
      : null;

    // Rotate the weapon with the right angle
    weaponCanvas = rotateCanvas(
      weaponCanvas,
      orientation,
      size
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

  private putEmoticon(): this {
    if (this.emoticon === null) {
      return this;
    }

    // Get the emoticon
    let emoticonCanvas = scaleCanvas(
      this.emoticon.getPartCanvas(this.emoticonPart),
      0.7
    );

    this.ctx.drawImage(
      emoticonCanvas,
      (this.canvas.width - emoticonCanvas.width) / 2,
      0,
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

    this.putEmoticon();
    
    return this;
  }
}

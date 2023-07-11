import {
  Canvas,
  loadImage,
  Image,
  createCanvas,
  CanvasRenderingContext2D
} from "canvas";

import { v4 as uuidv4 } from 'uuid';

import { AssetKind, AssetHelpSize, AssetPart, IAssetPartMetadata, getAssetPartMetadata, getAssetPartsMetadata, scaleMetadata } from "./part";
import { AssetError, FileError } from "../error";
import { getNameFromPath } from "../utils/util";
import { autoCropCanvas, canvasFromImageData, cloneCanvas, saveCanvas } from "../utils/canvas";
import { ColorRGBA, IColor } from "../color";
import Cache, { hashCacheKey } from "../cache";

/**
 * Represents any kind of dimension.
 * It is actually used to describe a lot of things.
 */
export type Dimensions = {
  w: number;
  h: number;
}

export type Position = {
  x: number;
  y: number;
}

/**
 * The interface `IAssetMetadata` defines the metadata information about an asset.
 */
export interface IAssetMetadata {
  baseSize: Dimensions;
  divisor: Dimensions;
  kind: AssetKind;
  name?: string
}

export const DEFAULT_METADATA = {
  baseSize: { w: 1, h: 1},
  divisor: { w: 1, h: 1},
  kind: AssetKind.UNKNOWN,
};


/**
 * Return a hash from a `IAssetMetadata` type.
 * @param metadata 
 * @returns Returns a MD5 hash of `metadata`
 */
function getCacheKey(metadata: IAssetMetadata): string {
  return hashCacheKey(JSON.stringify(metadata))
}

/**
 * The `export interface ISave` defines an interface that specifies two methods:
 * 
 * `save` and `saveAs`. These methods are used to save an asset to a file.
 */
export interface ISave {
  save: () => this;
  saveAs: (path: string) => this;
}

/**
 * This interface represents the miniman asset that can be used
 * in the whole library.
 * 
 * IAsset inherits this interface.
 * 
 * It has the basic method to manipulate an asset.
 */
export interface IMinimalAsset extends ISave {
  canvas: Canvas;
  readonly metadata: IAssetMetadata;
  
  setName: (name: string) => this;
  setColor: (color: IColor) => this;
  loadFromPath: (path: string) => Promise<this>;
  loadFromUrl: (url: string) => Promise<this>;
  loadFromCanvas: (canvas: Canvas) => this;
  empty: (assetHelpSize: AssetHelpSize) => this;
  scale: (assetHelpSize: AssetHelpSize) => this;
  restore: () => this;
}

export class MinimalAsset implements IMinimalAsset {
  canvas: Canvas;
  readonly metadata: IAssetMetadata;

  protected ctx: CanvasRenderingContext2D;
  protected originalCanvas: Canvas;
  
  constructor(metadata: IAssetMetadata) {
    this.metadata = metadata;
  }

  /**
   * This function returns the multiplier value based on the canvas width and base
   * size metadata.
   * @returns A scale factor
   */
  get multiplier(): number {
    if (this.metadata.baseSize.w === 0) {
      throw new AssetError('Invalid base size metadata.')
    }

    return this.canvas.width / this.metadata.baseSize.w
  }

  /**
   * This function creates an empty canvas with a specified size and returns the
   * object.
   * @param {AssetHelpSize} assetHelpSize - `assetHelpSize`
   * @returns this
   */
  empty(assetHelpSize: AssetHelpSize = AssetHelpSize.DEFAULT): this {
    return this.loadFromCanvas(
      createCanvas(
        this.metadata.baseSize.w * assetHelpSize,
        this.metadata.baseSize.h * assetHelpSize
      )
    );
  }

  /**
   * Scale the canvas using depending of `assetHelpSize`
   * @param assetHelpSize 
   * @returns this
   */
  scale(assetHelpSize: AssetHelpSize): this {
    const w = this.metadata.baseSize.w * assetHelpSize;
    const h = this.metadata.baseSize.h * assetHelpSize;

    if (
      w === this.canvas.width
      && h === this.canvas.height
    ) {
      return this;
    }

    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      this.canvas,
      0, 0,
      this.canvas.width, this.canvas.height,
      0, 0,
      w, h
    );
    
    return this.loadFromCanvas(canvas);
  }

  /**
   * This function loads a canvas and its context for further use.
   * @param {Canvas} canvas 
   * @returns A Promise that resolves to the current instance of the class.
   */
  loadFromCanvas(canvas: Canvas): this {
    this.canvas = canvas;
    // Deep copy to restore later
    this.originalCanvas = cloneCanvas(canvas);
    this.ctx = canvas.getContext('2d');

    return this;
  }

  /**
   * This function loads an image from a given path and sets it as the canvas
   * background.
   * @param {string} path - A string representing the file path of an image file.
   * @returns Promise<this>
   */
  async loadFromPath(path: string): Promise<this> {
    let img: Image;
  
    try {
      img = await loadImage(path);
    } catch (err) {
      throw new FileError('Wrong path: ' + path);
    }

    const canvas = createCanvas(
      img.width,
      img.height
    );
  
    canvas
      .getContext('2d')
      .drawImage(img, 0, 0);

    this.loadFromCanvas(canvas);
  
    this.setName(
      getNameFromPath(path)
    );
    
    return this;
  }

  /**
   * This function loads data from a URL using a path.
   * @param {string} url - A string representing the URL from which the data needs
   * to be loaded.
   * @returns Promise<this>
   */
  async loadFromUrl(url: string): Promise<this> {
    return await this.loadFromPath(url);
  }

  /**
   * The function sets the name property of an object and returns the object
   * itself.
   * @param {string} name - The `name` parameter is a string that represents the
   * name to be set for a metadata object.
   * @returns this
   */
  setName(name: string): this {
    this.metadata.name = name;
    
    return this
  }

  /**
   * The function restores the canvas and its context to their original state.
   * @returns The `restore()` method is returning the current instance of the
   * object (`this`) after restoring the canvas and its context to their original
   * state.
   */
  restore(): this {
    this.canvas = cloneCanvas(this.originalCanvas);
    this.ctx = this.canvas.getContext('2d');

    return this;
  }

  /**
   * This function saves an image file with the name of the metadata in PNG format.
   * @returns this
   */
  save(cropped: boolean = false): this {
    return this.saveAs(
      './' + this.metadata.name + '.png',
      cropped
    );
  }

  /**
   * This function saves the canvas as an image file at the specified path.
   * @param {string} path - A string representing the file path where the canvas
   * should be saved. This can include the file name and extension.
   * @returns this
   */
  saveAs(path: string, cropped: boolean = false): this {
    const canvas = cropped === true
      ? autoCropCanvas(this.canvas)
      : this.canvas;

    saveCanvas(path, canvas);

    return this;
  }

  /**
   * TODO
   */
  setColor(_color: IColor): this {
    return this;
  }
}

/**
 * Global variable for the minimal asset cache;
 */
let cacheMinimalAsset = new Cache<IMinimalAsset>;

export interface IAsset<T extends AssetPart = AssetPart> extends IMinimalAsset {
  multiplier: number;

  setVerification: (value: boolean) => this;
  getPartMetadata(assetPart: T): IAssetPartMetadata
  getPartCanvas(assetPart: T): Canvas;
  colorPart: (color: IColor, assetPart: T) => this;
  colorParts: (color: IColor, ...assetParts: T[]) => this 
  copyPart: (asset: IAsset<T>, assetPart: T) => this;
  copyParts: (asset: IAsset<T>, ...assetParts: T[]) => this;
  setPartSaveDirectory: (directory: string) => this;
  savePart: (assetPart: T) => this;
  saveParts: (...assetParts: T[]) => this;
}

export abstract class Asset<T extends AssetPart> extends MinimalAsset implements IAsset<T> {
  declare canvas: Canvas;
  declare readonly metadata: IAssetMetadata;

  declare protected ctx: CanvasRenderingContext2D;
  declare protected originalCanvas: Canvas;

  private partSaveDirectory: string;
  private verification: boolean;
  private id: string;
  
  constructor(metadata: IAssetMetadata) {
    super(metadata);

    this.partSaveDirectory = '.';
    this.id = uuidv4();
    this.verification = true;
  }

  /**
   * The function sets the verification value and returns the object instance.
   * @param {boolean} value - a boolean value that represents whether the
   * verification is set or not.
   * @returns this
   */
  setVerification(value: boolean): this {
    this.verification = value;
    
    return this;
  }

  /**
   * This function returns the metadata of a given asset part.
   * @param {T} assetPart - Asset part
   * @returns Asset part metadata
   */
  protected _getPartMetadata(assetPart: T): IAssetPartMetadata {
    return getAssetPartMetadata(
      this.metadata.kind,
      assetPart
    );
  }

  /**
   * This function returns scaled metadata for a given asset part.
   * @param {T} assetPart - Asset part
   * @returns Asset part metadata
   */
  getPartMetadata(assetPart: T): IAssetPartMetadata {
    return scaleMetadata(
      this._getPartMetadata(assetPart),
      this.multiplier
    );
  }

  /**
   * 
   * @param assetPart Asset part
   * @returns Part as a Canvas
   */
  getPartCanvas(assetPart: T): Canvas {
    const metadataPart = this.getPartMetadata(assetPart);

    const canvas = createCanvas(
      metadataPart.w,
      metadataPart.h
    );
    let ctx = canvas.getContext('2d');
    
    const imageData = this.ctx.getImageData(
      metadataPart.x,
      metadataPart.y,
      metadataPart.w,
      metadataPart.h
    );

    ctx.putImageData(
      imageData,
      0, 0
    );

    return canvas;
  }

  /**
   * This function checks if a canvas has a valid aspect ratio based on its width
   * and height.
   * @param {Canvas} [canvas]
   * @returns A boolean value indicating whether the canvas has a valid aspect
   * ratio or not.
   */
  private hasValidAspectRatio(canvas?: Canvas): boolean {
    const _canvas = canvas || this.canvas

    if (this.verification === false) {
      return true;
    }

    return _canvas.width % this.metadata.divisor.w === 0
      && _canvas.height % this.metadata.divisor.h === 0;
  }

  /**
   * This function loads an image from a canvas and throws an error if the image
   * has the wrong aspect ratio.
   * @param {Canvas} canvas
   * @returns this
   */
  loadFromCanvas(canvas: Canvas): this {
    if (this.hasValidAspectRatio(canvas) === false) {
      throw new FileError('Wrong image ratio');
    }

    return super.loadFromCanvas(canvas);
  }

  /**
   * 
   * @param color Color
   * @param assetPart Asset part
   * @param callback A function applied on every canvas byte
   * @returns 
   */
  protected _colorPart(
    color: IColor,
    assetPart: T,
    callback: (rgba: ColorRGBA, color: ColorRGBA) => void
  ): this {
    const partMetadata = this.getPartMetadata(assetPart);
    const colorRGBA = color.rgba() as ColorRGBA;

    let imageData = this.ctx.getImageData(
      partMetadata.x,
      partMetadata.y,
      partMetadata.w,
      partMetadata.h,
    );
    let buffer = imageData.data;

    let byteColor = new ColorRGBA(0, 0, 0, 0);

    for (let byte = 0; byte < buffer.length; byte += 4) {
      byteColor.r = buffer[byte];
      byteColor.g = buffer[byte + 1];
      byteColor.b = buffer[byte + 2];
      byteColor.a = buffer[byte + 3];

      callback(byteColor, colorRGBA)

      buffer[byte] = byteColor.r;
      buffer[byte + 1] = byteColor.g;
      buffer[byte + 2] = byteColor.b;
      buffer[byte + 3] = byteColor.a;
    }

    this.ctx.putImageData(
      imageData,
      partMetadata.x,
      partMetadata.y,
    );
    
    return this;
  }

  /**
   * This function takes a color and an asset part, retrieves the image data for
   * that part, applies the color to the image data, and then puts the modified
   * image data back into the canvas.
   * @param {IColor} color - Color
   * @param {T} assetPart - Asset part
   * @returns this
   */
  colorPart(color: IColor, assetPart: T): this {
    this._colorPart(
      color,
      assetPart,
      (rgba, colorRGBA) => {
        rgba
          .blackAndWhite()
          .applyColor(colorRGBA)
      }
    );
    
    return this;
  }

  /**
   * This function adds color parts to an asset.
   * @param {IColor} color - Color
   * @param {T[]} assetParts - Asset parts
   * @returns this
   */
  colorParts(color: IColor, ...assetParts: T[]): this {
    for (const assetPart of assetParts) {
      this.colorPart(color, assetPart);
    }

    return this;
  }

  /**
   * This function sets the color of an asset based on the provided color and
   * metadata.
   * @param {IColor} color - Color
   * @returns this
   */
  setColor(color: IColor): this {
    const parts = getAssetPartsMetadata(this.metadata.kind);

    return this.colorParts(
      color,
      ...Object.keys(parts) as T[]
    );
  }


  /**
   * This function copies a specific part of an asset onto another asset.
   * @param {IAsset} asset - The asset parameter is an object of type IAsset, which
   * represents an image.
   * @param {T} assetPart - Asset part
   * @returns this
   */
  copyPart(asset: IAsset<T>, assetPart: T): this{
    let fromMetadata = asset.getPartMetadata(assetPart);
    let toMetadata = this.getPartMetadata(assetPart);

    this.ctx.clearRect(
      toMetadata.x, toMetadata.y,
      toMetadata.w, toMetadata.h,
    );
    this.ctx.drawImage(
      asset.canvas,
      fromMetadata.x, fromMetadata.y,
      fromMetadata.w, fromMetadata.h,
      toMetadata.x, toMetadata.y,
      toMetadata.w, toMetadata.h
    );
  
    return this;
  }

  /**
   * The function copies parts of an asset to another asset.
   * @param {IAsset} asset - The asset parameter is an object of type IAsset, which
   * represents an image.
   * @param {T[]} assetParts - Asset parts
   * @returns this
   */
  copyParts(asset: IAsset<T>, ...assetParts: T[]): this {
    for (const assetPart of assetParts) {
      this.copyPart(asset, assetPart);
    }

    return this;
  }

  /**
   * This function sets the save directory for a part and returns the object
   * instance.
   * @param {string} directory - The `directory` parameter is a string that
   * represents the path to the directory where the saved parts will be stored.
   * @returns this
   */
  setPartSaveDirectory(directory: string): this {
    this.partSaveDirectory = directory
    
    return this;
  }

  /**
   * This function generates a cache key for a given asset part based on the
   * metadata and ID.
   * @param {T} assetPart - Asset part
   * @returns A cache key
   */
  protected getPartCacheKey(assetPart: T): string {
    let metadata = this.metadata;

    metadata.name = this.id
      + this.metadata.name 
      + '_' 
      + assetPart;

    return getCacheKey(metadata);
  }

  /**
   * This function saves a part of an asset as a PNG file.
   * @param {T} assetPart - Asset part
   * @returns this
   */
  savePart(assetPart: T): this {
    let canvas: Canvas;

    const cacheKey = this.getPartCacheKey(assetPart);
    let part = cacheMinimalAsset.get(cacheKey);
    
    if (part === null) {
      const partMetadata = this.getPartMetadata(assetPart);
  
      const imageData = this.ctx.getImageData(
        partMetadata.x,
        partMetadata.y,
        partMetadata.w,
        partMetadata.h
      );
      
      canvas = canvasFromImageData(imageData);

      // Does not required valid metadata because
      // it is not an IAsset.
      part = new MinimalAsset(DEFAULT_METADATA);
      part.loadFromCanvas(canvas);

      cacheMinimalAsset.set(cacheKey, part);
    }

    part.saveAs(
      this.partSaveDirectory + '/' + 
      assetPart + '.png'
    );

    return this;
  }

  /**
   * The function saves multiple asset parts and returns the object it belongs to.
   * @param {T[]} assetParts - Asset parts
   * @returns this
   */
  saveParts(...assetParts: T[]): this {
    for (const assetPart of assetParts) {
      this.savePart(assetPart);
    }
    
    return this;
  }
}

import {
  Canvas,
  loadImage,
  Image,
  createCanvas,
  CanvasRenderingContext2D
} from "canvas";

import { v4 as uuidv4 } from 'uuid';

import { AssetKind, AssetPart, IAssetPartMetadata, getAssetPartMetadata, getAssetPartsMetadata, scaleMetadata } from "./part";
import { AssetError, FileError } from "../error";
import { getNameFromPath } from "../utils/util";
import { canvasFromImageData, cloneCanvas, saveCanvas } from "../utils/canvas";
import { ColorRGBA, IColor } from "../color";
import { AssetHelpSize } from "./size";
import Cache, { hashCacheKey } from "../cache";

/**
 * Represents any kind of dimension.
 * It is actually used to describe a lot of things.
 */
type Dimensions = {
  w: number;
  h: number;
}
/**
 * The interface `IAssetMetadata` defines the metadata information about an asset.
 */
interface IAssetMetadata {
  baseSize: Dimensions;
  divisor: Dimensions;
  kind: AssetKind;
  name?: string
}

const DEFAULT_METADATA = {
  baseSize: { w: 1, h: 1},
  divisor: { w: 1, h: 1},
  kind: AssetKind.UNKNOWN,
};

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
   * @returns The `multiplier` property is returning a number which is the ratio of
   * the canvas width to the base size width of the asset's metadata. If the base
   * size width is 0, an `AssetError` is thrown.
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
   * @param {AssetHelpSize} assetHelpSize - `assetHelpSize` is an optional
   * parameter with a default value of `AssetHelpSize.DEFAULT`. It is used to
   * determine the size of the canvas that will be created. The canvas size is
   * calculated by multiplying the base size of the metadata by the `assetHelpSize`
   * value. The resulting canvas
   * @returns The function `empty` is returning the current instance of the object
   * (`this`) after performing some operations on its properties.
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
   * @returns The `loadFromPath` method is returning a Promise that resolves with
   * `this`, which refers to the instance of the class that the method is called
   * on.
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

  async loadFromUrl(url: string): Promise<this> {
    return await this.loadFromPath(url);
  }

  /**
   * The function sets the name property of an object and returns the object
   * itself.
   * @param {string} name - The `name` parameter is a string that represents the
   * name to be set for a metadata object.
   * @returns The method `setName` is returning `this`, which refers to the current
   * object instance. This allows for method chaining, where multiple methods can
   * be called on the same object instance in a single line of code.
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
   * @returns The `save()` method is returning the result of calling the `saveAs()`
   * method with a file path that includes the name of the metadata object and a
   * file extension of `.png`. The `saveAs()` method is likely responsible for
   * actually saving the file to disk. Therefore, the `save()` method is likely
   * returning a reference to the object instance to allow for method chaining.
   */
  save(): this {
    return this.saveAs('./' + this.metadata.name + '.png');
  }

  /**
   * This function saves the canvas as an image file at the specified path.
   * @param {string} path - A string representing the file path where the canvas
   * should be saved. This can include the file name and extension.
   * @returns the current instance of the object (this) after saving the canvas to
   * the specified path.
   */
  saveAs(path: string): this {
    saveCanvas(path, this.canvas);

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

export interface IAsset extends IMinimalAsset {
  multiplier: number;

  getPartMetadata(assetPart: AssetPart): IAssetPartMetadata
  colorPart: (color: IColor, assetPart: AssetPart) => this;
  colorParts: (color: IColor, ...assetParts: AssetPart[]) => this 
  copyPart: (asset: IAsset, assetPart: AssetPart) => this;
  copyParts: (asset: IAsset, ...assetParts: AssetPart[]) => this;
  setPartSaveDirectory: (directory: string) => this;
  savePart: (assetPart: AssetPart) => this;
  saveParts: (...assetParts: AssetPart[]) => this;
}

export abstract class Asset<T extends AssetPart> extends MinimalAsset implements IAsset {
  declare canvas: Canvas;
  declare readonly metadata: IAssetMetadata;

  declare protected ctx: CanvasRenderingContext2D;
  declare protected originalCanvas: Canvas;

  private partSaveDirectory: string;
  private id: string;
  
  /**
   * This is a constructor function that takes in an object of type IAssetMetadata
   * and calls the constructor of its parent class with the same argument.
   * @param {IAssetMetadata} metadata - The parameter `metadata` is of type
   * `IAssetMetadata` and is being passed to the constructor of a class that
   * extends another class. It is likely that the `metadata` parameter contains
   * information about an asset, such as its name, type, size, and other relevant
   * details. The `super
   */
  constructor(metadata: IAssetMetadata) {
    super(metadata);

    this.partSaveDirectory = '.';
    this.id = uuidv4();
  }

  protected _getPartMetadata(assetPart: T): IAssetPartMetadata {
    return getAssetPartMetadata(
      this.metadata.kind,
      assetPart
    );
  }

  getPartMetadata(assetPart: T): IAssetPartMetadata {
    return scaleMetadata(
      this._getPartMetadata(assetPart),
      this.multiplier
    );
  }

  /**
   * This function checks if a canvas has a valid aspect ratio based on its width
   * and height.
   * @param {Canvas} [canvas] - The `canvas` parameter is an optional parameter of
   * type `Canvas`. If a `canvas` object is passed as an argument, it will be used
   * to check the aspect ratio. If no argument is passed, the `canvas` property of
   * the current object (`this.canvas`) will be used instead.
   * @returns A boolean value indicating whether the canvas has a valid aspect
   * ratio or not.
   */
  private hasValidAspectRatio(canvas?: Canvas): boolean {
    const _canvas = canvas || this.canvas

    return _canvas.width % this.metadata.divisor.w === 0
    && _canvas.height % this.metadata.divisor.h === 0;
  }

  /**
   * This function loads an image from a canvas and throws an error if the image
   * has the wrong aspect ratio.
   * @param {Canvas} canvas
   * @returns The `loadFromCanvas` method is returning a Promise that resolves to
   * `this`, which refers to the current instance of the class.
   */
  loadFromCanvas(canvas: Canvas): this {
    if (this.hasValidAspectRatio(canvas) === false) {
      throw new FileError('Wrong image ratio');
    }

    return super.loadFromCanvas(canvas);
  }

  /**
   * TODO
   * @param _color 
   * @param assetPart 
   * @returns 
   */
  colorPart(color: IColor, assetPart: T): this {
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

      byteColor.applyColor(colorRGBA);

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
   * This function adds color parts to an asset.
   * @param {IColor} color - The `color` parameter is of type `IColor`, which is
   * likely an interface or a class representing a color value. It is used as an
   * argument for the `colorPart` method, which is called for each `assetPart` in
   * the `assetParts` array.
   * @param {T[]} assetParts - `assetParts` is a rest parameter that allows the
   * function to accept an arbitrary number of arguments as an array. In this case,
   * it is used to pass in an array of asset parts that need to be colored with the
   * given color.
   * @returns The `colorParts` method is returning `this`, which refers to the
   * instance of the class that the method is being called on. This allows for
   * method chaining, where multiple methods can be called on the same instance in
   * a single line of code.
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
   * @param {IColor} color - The `color` parameter is of type `IColor`, which is
   * likely an interface or type that defines a color value. This parameter is used
   * to set the color of the asset.
   * @returns The `setColor` method is returning `this`, which refers to the
   * instance of the class that the method is being called on. This allows for
   * method chaining, where multiple methods can be called on the same instance in
   * a single line of code.
   */
  setColor(color: IColor): this {
    const parts = getAssetPartsMetadata(this.metadata.kind);

    return this.colorParts(
      color,
      ...Object.keys(parts) as T[]
    );
  }

  /**
   * TODO
   */
  copyPart(asset: IAsset, assetPart: T): this{
    if (this.metadata.kind !== asset.metadata.kind) {
      throw new AssetError("Both asset must have the same kind.")
    }

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
   * @param {IAsset} asset - The `asset` parameter is an object of type `IAsset`.
   * It is likely an asset that contains multiple parts that need to be copied.
   * @param {T[]} assetParts - `assetParts` is a rest parameter of type `T[]`,
   * which means it can accept any number of arguments of type `T` and store them
   * in an array. In this context, it is used to pass in multiple asset parts that
   * need to be copied from the `asset` object.
   * @returns The `copyParts` method is returning `this`, which refers to the
   * instance of the class that the method is called on. This allows for method
   * chaining, where multiple methods can be called on the same instance in a
   * single line of code.
   */
  copyParts(asset: IAsset, ...assetParts: T[]): this {
    for (const assetPart of assetParts) {
      this.copyPart(asset, assetPart);
    }

    return this;
  }

  setPartSaveDirectory(directory: string): this {
    this.partSaveDirectory = directory
    
    return this;
  }

  protected getPartCacheKey(assetPart: T): string {
    let metadata = this.metadata;

    metadata.name = this.id
      + this.metadata.name 
      + '_' 
      + assetPart;

    return getCacheKey(metadata);
  }

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

  saveParts(...assetParts: T[]): this {
    for (const assetPart of assetParts) {
      this.savePart(assetPart);
    }
    
    return this;
  }
}

/**
 * Abstract class used for every exception.
 */
abstract class BaseError extends Error {
  constructor(message: string) {
    super(message);

    this.name = this.constructor.name;
  }
}

/**
 * File exceptions.
 */
export class FileError extends BaseError {}
/**
 * Asset exceptions.
 */
export class AssetError extends BaseError {}
/**
 * Asset part exceptions.
 */
export class AssetPartError extends BaseError {}
/**
 * Scene exceptions.
 */
export class SceneError extends BaseError {}
/**
 * Color exceptions.
 */
export class ColorError extends BaseError {}
/**
 * Board exceptions.
 */
export class BoardError extends BaseError {}

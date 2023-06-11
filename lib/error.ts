abstract class BaseError extends Error {
  constructor(message: string) {
    super(message);

    this.name = this.constructor.name;
  }
}

export class FileError extends BaseError { };
export class AssetError extends BaseError { };
export class AssetPartError extends BaseError { };
export class ElementError extends BaseError { };
export class SceneError extends BaseError { };
export class ColorError extends BaseError { };

import { closestNumber } from './utils/util';

import { IAsset } from './asset/base';
import { Logger } from './logger';
import { createCanvas } from 'canvas';

/**
 * This function resizes an asset's canvas to match a specified base size while
 * maintaining aspect ratio.
 * @param {IAsset} asset - A boolean, indicating if the operation has been successfully.
 */
export function fixAssetSize(asset: IAsset): boolean {
  let canvas = asset.canvas;
  const metadata = asset.metadata;
  const ratio = metadata.baseSize.w / metadata.baseSize.h;

  let fixedWidth = closestNumber(
    canvas.width,
    metadata.baseSize.w
  );

  const fixedHeight = closestNumber(
    canvas.height,
    metadata.baseSize.h
  );

  // Prevention
  fixedWidth = ratio * fixedHeight;

  if (
    fixedWidth === canvas.width
    && fixedHeight === canvas.height
  ) {
    Logger.debug(metadata.name + ' already has a good size.')
    return false
  }

  let fixedCanvas = createCanvas(fixedWidth, fixedHeight);
  const ctx = fixedCanvas.getContext('2d');

  ctx.drawImage(
    canvas,
    0, 0,
    canvas.width, canvas.height,
    0, 0,
    fixedWidth, fixedHeight
  );

  asset.canvas = fixedCanvas;

  return true;
}

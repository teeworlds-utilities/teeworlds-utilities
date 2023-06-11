import { Asset } from './base';
import { AssetKind, ParticulePart } from './part';

const PARTICULE_METADATA = {
  baseSize: {w: 512, h: 512},
  divisor: {w: 8, h: 8},
  kind: AssetKind.PARTICULE,
}

export default class Particule extends Asset<ParticulePart> {
  constructor() {
    super(PARTICULE_METADATA);
  }
}

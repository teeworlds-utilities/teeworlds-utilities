import { Asset } from './base';
import { AssetKind, EmoticonPart } from './part';

const EMOTICON_METADATA = {
  baseSize: {w: 512, h: 512},
  divisor: {w: 4, h: 4},
  kind: AssetKind.EMOTICON,
}

export default class Emoticon extends Asset<EmoticonPart> {
  constructor() {
    super(EMOTICON_METADATA);
  }
}

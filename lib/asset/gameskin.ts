import { Asset } from './base';
import { AssetKind, GameskinPart } from './part';

const GAMESKIN_METADATA = {
  baseSize: {w: 1024, h: 512},
  divisor: {w: 32, h: 16},
  kind: AssetKind.GAMESKIN,
}

export default class Gameskin extends Asset<GameskinPart> {
  constructor() {
    super(GAMESKIN_METADATA);
  }
}

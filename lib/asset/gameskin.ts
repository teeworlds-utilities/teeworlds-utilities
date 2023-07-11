import { Asset } from './base';
import { AssetKind, GameskinPart } from './part';

export default class Gameskin extends Asset<GameskinPart> {
  constructor() {
    super(
      {
        baseSize: {w: 1024, h: 512},
        divisor: {w: 32, h: 16},
        kind: AssetKind.GAMESKIN,
      }
    );
  }
}

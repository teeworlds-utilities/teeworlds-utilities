import { Asset } from "./base";
import { AssetKind, EmoticonPart } from "./part";

export default class Emoticon extends Asset<EmoticonPart> {
  constructor() {
    super({
      baseSize: { w: 512, h: 512 },
      divisor: { w: 4, h: 4 },
      kind: AssetKind.EMOTICON,
    });
  }
}

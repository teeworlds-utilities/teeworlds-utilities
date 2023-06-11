import Skin from './asset/skin';
import { fixAssetSize } from './fix';

describe('Fix asset', () => {
  test('Fix an asset with bad size', async () => {
    const skin = new Skin().setVerification(false);

    await skin.loadFromPath('data/skins/bad_size_skin.png');

    expect(fixAssetSize(skin)).toBe(true);
  });

  test('Fix an asset with good size', async () => {
    const skin = new Skin().setVerification(false);

    await skin.loadFromPath('data/skins/nanami.png');

    expect(fixAssetSize(skin)).toBe(false);
  });
});
  
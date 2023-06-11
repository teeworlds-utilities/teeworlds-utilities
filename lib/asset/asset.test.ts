import { unlinkSync, rmSync } from 'fs'
import Skin from './skin';
import Gameskin from './gameskin';
import { GameskinPart, SkinPart } from './part';
import { ColorRGB } from '../color';

const SKIN = 'data/skins/ahl_red_nanami.png';
// const DEFAULT_NANAMI = 'data/skins/ahl_red_nanami.png';
const TERRORIST = 'data/skins/Terrorist.png';
const GAMESKIN = 'data/gameskins/ahl_red.png';
const GAMESKIN_SRC = 'data/gameskins/cellegen_grid.png';
const GAMESKIN_4K = 'data/gameskins/4k.png';

describe('Abstract class Asset', () => {
  test('Load from path', async () => {
    const skin = new Skin();

    await skin.loadFromPath(SKIN);
  });

  test('Load and save the canvas as PNG', async () => {
    const path = 'skin_test.png';
    const skin = new Skin();

    await skin.loadFromPath(SKIN);
    skin.saveAs(path);

    unlinkSync(path);
  });

  test('Load and save gameskin part', async () => {
    const gameskin = new Gameskin();
    const dir = './gameskin_parts'

    await gameskin.loadFromPath(GAMESKIN);

    gameskin
      .setPartSaveDirectory(dir)
      .saveParts(
        GameskinPart.SHOTGUN_AMMO,
        GameskinPart.GUN,
        GameskinPart.GUN_PARTICLE_1,
        GameskinPart.GUN_PARTICLE_3,
        GameskinPart.LASER,
      )
      .savePart(GameskinPart.GRENADE);

    rmSync(dir, { recursive: true, force: true });
  });

  test('Color parts of gameskin', async () => {
    const gameskin = new Gameskin();
    const color = new ColorRGB(0, 127, 0);

    await gameskin.loadFromPath(GAMESKIN);

    gameskin
      .colorParts(
        color,
        GameskinPart.SHOTGUN_AMMO,
        GameskinPart.GUN,
        GameskinPart.GUN_PARTICLE_1,
        GameskinPart.GUN_PARTICLE_3,
        GameskinPart.LASER,
      )
      .colorPart(color, GameskinPart.GRENADE)
  });

  test('Copy parts of gameskin (from a bigger one)', async () => {
    const gameskin = new Gameskin();
    await gameskin.loadFromPath(GAMESKIN);

    const gameskin_src = new Gameskin();
    await gameskin_src.loadFromPath(GAMESKIN_SRC);

    const gameskin_4K = new Gameskin();
    await gameskin_4K.loadFromPath(GAMESKIN_4K);

    gameskin
      .copyParts(
        gameskin_src,
        GameskinPart.SHOTGUN_AMMO,
        GameskinPart.GUN,
        GameskinPart.GUN_PARTICLE_1,
        GameskinPart.GUN_PARTICLE_3,
        GameskinPart.LASER,
      )
      .copyParts(
        gameskin_4K,
        GameskinPart.HAMMER,
        GameskinPart.HAMMER_CURSOR,
        GameskinPart.GRENADE,
        GameskinPart.SHIELD,
      )
  });

  test('Copy parts of gameskin (from a smaller one)', async () => {
    const gameskin = new Gameskin();
    await gameskin.loadFromPath(GAMESKIN);

    const gameskin_src = new Gameskin();
    await gameskin_src.loadFromPath(GAMESKIN_SRC);

    const gameskin_4K = new Gameskin();
    await gameskin_4K.loadFromPath(GAMESKIN_4K);

    gameskin_4K
      .copyParts(
        gameskin_src,
        GameskinPart.SHOTGUN_AMMO,
        GameskinPart.GUN,
        GameskinPart.GUN_PARTICLE_1,
        GameskinPart.GUN_PARTICLE_3,
        GameskinPart.LASER,
      )
      .copyParts(
        gameskin,
        GameskinPart.HAMMER,
        GameskinPart.HAMMER_CURSOR,
        GameskinPart.GRENADE,
        GameskinPart.SHIELD,
      )
  });

  test('Render skin then save', async () => {
    const path = 'skin.png'
    const skin = new Skin();

    await skin.loadFromPath(SKIN);

    skin
      .render()
      .saveRenderAs(path);

    unlinkSync('render_' + path);
  });

  test('Color skin then render', async () => {
    const path = 'skin.png'
    const skin = new Skin();

    await skin.loadFromPath(TERRORIST);

    skin
      .colorParts(
        new ColorRGB(0, 0, 0),
        SkinPart.BODY,
        SkinPart.DEFAULT_EYE
      )
      .colorPart(
        new ColorRGB(255, 255, 255),
        SkinPart.FOOT,
      )
      .render()
      .saveRenderAs(path);

      unlinkSync('render_' + path);
  });
});

import { unlinkSync } from 'fs';
import Scene from './scene';

const SCENES = [
  'example',
  'generic',
  'generic_armor',
  'grass',
  'grass_house'
];

const sceneTest = async (path: string): Promise<Scene> => {
  const scene = new Scene(path).preprocess();
  await scene.renderScene();

  return scene;
}

describe('Scene maker', () => {
  test('Load a scene from a scheme', async () => {
    await sceneTest('data/scenes/schemes/grass.json');
  });

  test('Load a scene from an invalid scheme', async () => {
    await expect(sceneTest('invalid.json'))
    .rejects
    .toThrow();
  });

  test('Load every scene from built-in schemes then save them', async () => {
    let scene: Scene;
    let path: string;

    for (const sceneName of SCENES) {
      scene = await sceneTest('data/scenes/schemes/' + sceneName + '.json');
      path = sceneName + '.png';
      
      scene.saveScene(path);

      unlinkSync(path);
    }
  });
});

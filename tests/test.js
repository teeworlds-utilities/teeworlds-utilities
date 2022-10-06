const {
  TwAssetExtractor,
  TwAssetChanger,
  TwAssetFix,
  TwSceneMaker,
  TwPersonalCard
} = require('../build/main/index');

const extractTest = async () => {
  // Url or path to local file

  const asset = new TwAssetExtractor(
    'skin',
    'https://api.skins.tw/database/skins/7n8qP5OyLUVwIB8q9hJaHvYAOArvsaMwtf2mWHDZ.png'
  );
  //const asset = new TwAssetExtractor("emoticons", "file path")

  try {
    // Load the img
    await asset.preprocess();

    // Extract every element on the image
    asset.extractAll();

    // Or Extract selected elements
    //  asset.extract("1", "4", "9", "14")
    //  asset.extract("grenade", "gun")
    //  asset.extract("hammer_cursor")

    // Add a hat (xmas hat by default)
    await asset.setHat('./data/xmas_hat.png');

    // Save locally the image
    asset.save('./tmp2');
  } catch (err) {
    console.log(err);
  }
};

const ChangeTest = async () => {
  // Url or path to local file

  // const asset = new TwAssetChanger("skin", src, dest1, dest_url2, dest3)
  const asset = new TwAssetChanger(
    'gameskin',
    'https://api.skins.tw/database/gameskins/96wfbwDtzM1q77yahyv36HgKn64s6TVqcRwghZG3.png',
    'https://api.skins.tw/database/gameskins/CBu1DENdEAFV3v6VBvQkrAESEHIcpLgf8zZG3J9w.png'
  );

  try {
    await asset.preprocess();

    asset
      .extract('hammer', 'flag_red', 'shield', 'grenade')
      .setColorAll('255, 0, 0', 'rgb')
      .change('hammer', 'flag_red', 'shield', 'grenade')
      .save('./tmp', 'test_new.png');
  } catch (err) {
    console.log(err);
  }
};

const renderTest = async () => {
  // Url or path to local file

  const asset = new TwAssetExtractor(
    'skin',
    'https://api.skins.tw/database/skins/YvpMQvhYrX8lzzbB9VS4E7ay9f5JzD6k4V7QjApg.png'
  );

  try {
    await asset.preprocess();
    // asset.render()
    asset.render().saveRender('./tmp');
  } catch (err) {
    console.log(err);
  }
};

const colorTest = async () => {
  // Url or path to local file

  const asset = new TwAssetExtractor(
    'skin',
    'https://api.skins.tw//database/skins/brownbear.png'
  );

  try {
    await asset.preprocess();
    asset
      .extract('body', 'foot', 'happy_eye', 'body_shadow', 'foot_shadow')
      .setColor('0, 0, 0', 'rgb', 'body')
      .setColor('0, 0, 0', 'rgb', 'foot')
      .setColor('0, 0, 0', 'rgb', 'body_shadow')
      .setColor('0, 0, 0', 'rgb', 'foot_shadow')
      .setColor('0, 0, 0', 'rgb', 'happy_eye')
      .save('./tmp')
      .render('happy_eye')
      .saveRender('./tmp', 'sheesh.png');
  } catch (err) {
    console.log(err);
  }
};

const sceneTest = async (name) => {
  const scene = new TwSceneMaker('./data/scenes/schemes/' + name + '.json');

  try {
    scene.preprocess();
    await scene.renderScene();
    scene.saveScene('./scenes', name + '.png');
  } catch (err) {
    console.log(err);
  }
};

const defaultScenes = async (...scenes) => {
  for (const scene of scenes) {
    await sceneTest(scene);
  }
};

const cardTest = async () => {
  const card = new TwPersonalCard()
    .setUsername('Nagi01 {LAN}')
    .setSince('2014')
    .setGamemode('Vanilla GCTF FNG Gores ')
    .setClan('Fu and many others')
    .setDescription('im the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earth');

  try {
    await card.setRandomBackground('./data/scenes/backgrounds/');
    await card.process();
    
    card.save('card', 'nagi.png');
  } catch (error) {
    console.error(error);
  }
}

// extractTest();
// ChangeTest();
// renderTest();
// colorTest();
// defaultScenes('example', 'generic', 'generic_armor', 'grass', 'grass_house');
cardTest();

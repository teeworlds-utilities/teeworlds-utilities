# 🐞 tw-utils

### Install

```bash
npm i @b0th/tw-utils
```

### Contact

Feel free to contact me if you have any questions 
**Discord**: `b0th#6474`

### Getting started

Asset categories are : 
- skin
- gameskin
- emoticon
- particule

You can check `src/data.js` for informations and `tests/test.js` too for more examples.

### REST API example
[Rendering (with colors) basic API](https://github.com/theobori/tw-utils-api)

#### Asset extractor

```js
const { TwAssetExtractor } = require("@b0th/tw-utils")

const extractTest = async () => {
    // Url or path to local file

    const asset = new TwAssetExtractor("gameskin", "url")

    try {
        // Load the img
        await asset.preprocess()

        // Extract every element on the image
        asset.extractAll()

        // Or Extract selected elements
        //asset.extract("1", "4", "9", "14", etc...)
        //asset.extract("grenade", "gun", etc...)
        //asset.extract("hammer_cursor", etc...)

        // Add a hat (xmas hat by default)
        // await asset.setHat()

        // Save locally the image in ./tmp

        asset.save("./tmp")
    } catch (err) {
        console.log(err)
    }
}
```

#### Asset Changer

```js
const { TwAssetChanger } = require("@b0th/tw-utils")

const ChangeTest = async () => {
    // Url or path to local file

    const asset = new TwAssetChanger("skin", "src", "dest1", "dest_url2", "dest3")
    
    try {
        await asset.preprocess()
        // Extract the needed elements
        asset
        .extract("gun", "hammer", "shotgun", "gun_cursor")
        //asset.extractAll()

        // Change this elements on the dest(s)
        .change("gun", "hammer", "shotgun", "gun_cursor")

        // Save locally the image in ./tmp

        .save("./tmp")
        // asset.save("./tmp", "optional_name.png")
    } catch (err) {
        console.log(err) 
    }
}
```

#### Skin renderer
```js
const { TwAssetExtractor } = require("@b0th/tw-utils")

const renderTest = async () => {
    // Url or path to local file

    const asset = new TwAssetExtractor("skin", "url")

    try {
        await asset.preprocess()
        //asset.render()
        .render("happy_eye")

        // Save locally the image in ./tmp

        .saveRender("./tmp")
        // asset.saveRender("./tmp", "optional_name.png")
    } catch (err) {
        console.log(err)
    }
}
```

#### Changing Color

HSL color mode will be added in a future update

```js
const { TwAssetExtractor } = require("@b0th/tw-utils")

const colorTest = async () => {
    // Url or path to local file

    const asset = new TwAssetExtractor("skin", "url")

    try {
        await asset.preprocess()
        .extract("body")

        // Apply color to the body
        .setColor("255, 0, 0", "rgb", "body")
        //asset.setColor("255, 0, 0", "hsl", "body")
        //asset.setColorAll("255, 0, 0", "rgb")

        // Render with a red body
        .render("happy_eye")

        // Save locally the image in ./tmp
        .saveRender("./tmp")
    } catch (err) {
        console.log(err)
    }
}
```

#### Asset fix

```js
const { TwAssetFix } = require("@b0th/tw-utils")

const fixTest = async () =>
{
    const asset = new TwAssetFix("skin", "url")

    try {
        await asset.preprocess()
    
        asset
        .fix()
        .save("./fix")
    } catch (err) {
        console.log(err)
    }
}
```

#### Scenes system, basic example

```js
const { TwAssetExtractor, TwSceneMaker } = require("@b0th/tw-utils")

const fixTest = async () =>
{
    const scene = new TwSceneMaker()

    try {
        // Rendering the scene
        await scene.renderFromFile("scheme path")
        scene.saveScene(".", "example.png")
    } catch (err) {
        console.log(err)
    }
}
```

#### Scenes system, fancy example

```js
const { TwAssetExtractor, TwSceneMaker } = require("@b0th/tw-utils")

const fixTest = async () =>
{
    const scene = new TwSceneMaker()
    const tee = new TwAssetExtractor("skin", "url")

    try {
        await tee.preprocess()

        tee
        .extract("body", "foot")
        .setColor("0, 0, 0", "rgb", "body")
        .setColor("0, 0, 0", "rgb", "foot")
        .render("angry_eye")

        const renderCanvas = tee.rCanvas

        // Rendering the scene
        await scene.renderFromFile("scheme path")
        
        // Pasting the colored tee
        scene
        .pasteCanvas(tee.rCanvas, 200, 138, 225, 225)
        .saveScene(".", "example.png")
    } catch (err) {
        console.log(err)
    }
}
```

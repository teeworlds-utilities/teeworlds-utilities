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

check `src/data.js`

You can check `tests/test.js` too.

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
        asset.extract("gun", "hammer", "shotgun", "gun_cursor")
        //asset.extractAll()

        // Change this elements on the dest(s)
        asset.change("gun", "hammer", "shotgun", "gun_cursor")

        // Save locally the image in ./tmp

        asset.save("./tmp")
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
        asset.render("happy_eye")

        // Save locally the image in ./tmp

        asset.saveRender("./tmp")
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

    const asset = new TwAssetExtractor("skin", "https://api.skins.tw/database/skins/7n8qP5OyLUVwIB8q9hJaHvYAOArvsaMwtf2mWHDZ.png")

    try {
        await asset.preprocess()
        asset.extract("body")

        // Apply color to the body
        asset.setColor("255, 0, 0", "default", "body")
        //asset.setColorAll("255, 0, 0", "default")

        // Render with a red body
        asset.render("happy_eye")

        // Save locally the image in ./tmp
        asset.saveRender("./tmp")
    } catch (err) {
        console.log(err)
    }
}
```
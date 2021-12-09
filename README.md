# 🐞 tw-utils

### How to install dependencies ?

```bash
npm i @b0th/tw-utils
```

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

    const asset = new TwAssetExtractor("skin", "https://api.skins.tw/database/skins/G9JKA2lDW6bIHPoK9i7sGeNIPxVvY6FF9UJctMUD.png")

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
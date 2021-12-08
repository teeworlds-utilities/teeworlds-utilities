const { TwAssetExtractor, TwAssetChanger } = require("../src/lib")

const SRC_SKIN = "./data/greyfox.png"
const SRC_GAME = "./data/game.png"
const SRC_EMOTICONS = "./data/emoticons.png"

extractTest = async () => {
    const asset = new TwAssetExtractor("https://api.skins.tw/database/emoticons/mIIEcMZz1BSqnsmh9vfmtsE4e08wgK19RsuGEdaR.png", "emoticons")

    try {
        // Load the img
        await asset.preprocess()

        // Extract every element on the image
        asset.extractAll()

        // Or Extract selected elements
        //asset.extract("foot")
        //asset.extract("foot")
        //asset.extract("hand")

        // Save locally the image
        asset.save("./tmp")
    } catch (err) {
        console.log(err)
    }
}

extractTest()
const image = require("../src/lib");

const SRC_SKIN = "./data/greyfox.png"
const SRC_GAME = "./data/game.png"
const SRC_EMOTICONS = "./data/emoticons.png"

const extractTest = async () => {
    const asset = new image.TwAsset(SRC_EMOTICONS, "emoticons")

    try {
        await asset.preprocess()
        asset.extractAll()
        //asset.extract("foot")
        //asset.extract("foot")
        //asset.extract("hand")
        asset.save("./emoticons")
    } catch (err) {
        console.log(err)
    }

}

extractTest()

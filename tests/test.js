const image = require("../src/lib");

const SRC = "./data/greyfox.png"

const extractSkin = async () => {
    const asset = new image.TwAsset(SRC, "skin")

    try {
        await asset.preprocess()
        //asset.extractAll()
        asset.extract("foot")
        asset.extract("foot")
        asset.extract("hand")
        asset.save("./tmp")
    } catch (err) {
        console.log(err)
    }

}

const extractGameskin = async () => {
    ;
} 

extractSkin()
const image = require("../src/lib");

const extractSkin = async () => {
    const asset = new image.TwAsset("./data/default.png", "skin")

    try {
        await asset.preprocess()
        //asset.extractAll("./tmp")
        asset.extract("foot", "./tmp")
    } catch (err) {
        console.log(err)
    }

}

const extractGameskin = async () => {
    ;
}

extractSkin()
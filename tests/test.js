const { TwAssetExtractor, TwAssetChanger } = require("../src/lib")

const SRC_SKIN = "./data/greyfox.png"
const DEST_SKIN = "./data/default.png"
const SRC_GAME = "./data/game.png"
const SRC_EMOTICONS = "./data/emoticons.png"

extractTest = async () => {
    // Url or path to local file

    const asset = new TwAssetExtractor("gameskin", "https://media.discordapp.net/attachments/778030245436719124/846108332347097098/starwarsedited.png")
    //const asset = new TwAssetExtractor("emoticons", "./data/emoticons.png")

    try {
        // Load the img
        await asset.preprocess()

        // Extract every element on the image
        asset.extractAll()

        // Or Extract selected elements
        //asset.extract("1", "4", "9", "14")
        //asset.extract("grenade", "gun")
        //asset.extract("hammer_cursor")

        // Save locally the image
        asset.save("./tmp")
    } catch (err) {
        console.log(err)
    }
}

ChangeTest = async () => {
    // Url or path to local file

    // const asset = new TwAssetChanger("skin", src, dest1, dest_url2, dest3)
    const asset = new TwAssetChanger("skin", SRC_SKIN, DEST_SKIN)
    try {
        await asset.preprocess()
        asset.change("body", "foot")
        asset.save("./ttt")
    } catch (err) {
        console.log(err) 
    }
}

//extractTest()
//ChangeTest()
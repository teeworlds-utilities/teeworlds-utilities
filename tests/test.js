const { TwAssetExtractor, TwAssetChanger } = require("../src/index")

extractTest = async () => {
    // Url or path to local file

    const asset = new TwAssetExtractor("gameskin", "https://media.discordapp.net/attachments/778030245436719124/846108332347097098/starwarsedited.png")
    //const asset = new TwAssetExtractor("emoticons", "file path")

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
    const asset = new TwAssetChanger("gameskin",
    "https://api.skins.tw/database/gameskins/CBu1DENdEAFV3v6VBvQkrAESEHIcpLgf8zZG3J9w.png",
    "https://api.skins.tw/database/gameskins/96wfbwDtzM1q77yahyv36HgKn64s6TVqcRwghZG3.png",
    )

    try {
        await asset.preprocess()
        asset.change("hammer", "flag_red", "shield", "grenade")
        asset.save("./tmp")
    } catch (err) {
        console.log(err) 
    }
}

//extractTest()
ChangeTest()
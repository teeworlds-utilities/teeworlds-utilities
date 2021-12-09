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
    "https://images-ext-2.discordapp.net/external/_UPwoXfGQusIM27Lcmt-TV24NgM0MITY7epMXUm88Ig/https/api.skins.tw/database/gameskins/E1aon7KGT89pkYufukGxhr6HQqr2ADXplk27CO4L.png",
    "https://media.discordapp.net/attachments/904367949220040704/918225247365373962/kkub.png"
    )

    try {
        await asset.preprocess()
        asset.change("hook", "shotgun", "grenade", "heart")
        asset.save("./tmp")
    } catch (err) {
        console.log(err) 
    }
}

extractTest()
ChangeTest()
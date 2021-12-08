const { TwAssetExtractor, TwAssetChanger } = require("../src/lib")

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
    "https://images-ext-1.discordapp.net/external/nz2MlRvLcVywmc4oOi9r0Ad0ZScJquv2Jlr4aFkBvoE/https/api.skins.tw/database/gameskins/8WRx0AHpOlOrBB48vqAVBnqGNKyuNd8pz5DK1zjk.png",
    "https://images-ext-1.discordapp.net/external/qf9tG9-wX6CyaiM23iRE1kgvdYZoDZuQJexlA8_oyQQ/https/api.skins.tw/database/gameskins/ERCZ9JjslTT6eLV5lnLB0ls3SNSAY9wUeVMWJzjA.png",
    "https://images-ext-2.discordapp.net/external/WJgFzky1G0aO9t6ElQqEWqGsI0__Xpym7U5ctvvSTfM/https/api.skins.tw/database/gameskins/s60Mye1GF5a7SnrzTxGRwJCCvjc1QdZ31jKuJ5fz.png")

    try {
        await asset.preprocess()
        asset.change("gun", "hammer", "shotgun", "gun_cursor")
        asset.save("./tmp")
    } catch (err) {
        console.log(err) 
    }
}

//extractTest()
//ChangeTest()
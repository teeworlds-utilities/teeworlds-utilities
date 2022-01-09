const { TwAssetExtractor, TwAssetChanger } = require("../src/index")

const extractTest = async () => {
    // Url or path to local file

    const asset = new TwAssetExtractor("skin", "https://api.skins.tw/database/skins/7n8qP5OyLUVwIB8q9hJaHvYAOArvsaMwtf2mWHDZ.png")
    //const asset = new TwAssetExtractor("emoticons", "file path")

    try {
        // Load the img
        await asset.preprocess()

        // Extract every element on the image
        asset.extract("body", "body_shadow")

        // Or Extract selected elements
        //  asset.extract("1", "4", "9", "14")
        //  asset.extract("grenade", "gun")
        //  asset.extract("hammer_cursor")

        // Add a hat (xmas hat by default)
        // await asset.setHat()

        // Save locally the image
        asset.save("./tmp")
    } catch (err) {
        console.log(err)
    }
}

const ChangeTest = async () => {
    // Url or path to local file

    // const asset = new TwAssetChanger("skin", src, dest1, dest_url2, dest3)
    const asset = new TwAssetChanger("gameskin",
    "https://api.skins.tw/database/gameskins/96wfbwDtzM1q77yahyv36HgKn64s6TVqcRwghZG3.png",
    "https://api.skins.tw/database/gameskins/CBu1DENdEAFV3v6VBvQkrAESEHIcpLgf8zZG3J9w.png",
    )

    try {
        await asset.preprocess()
        asset.extract("hammer", "flag_red", "shield", "grenade")
        asset.setColorAll("255, 0, 0", "rgb")
        asset.change("hammer", "flag_red", "shield", "grenade")
        asset.save("./tmp", "test_new.png")
    } catch (err) {
        console.log(err) 
    }
}

const renderTest = async () => {
    // Url or path to local file

    const asset = new TwAssetExtractor("skin", "https://api.skins.tw/database/skins/7n8qP5OyLUVwIB8q9hJaHvYAOArvsaMwtf2mWHDZ.png")

    try {
        await asset.preprocess()
        // asset.render()
        asset.render("scary_eye")
        asset.saveRender("./tmp")
    } catch (err) {
        console.log(err)
    }
}

const colorTest = async () => {
    // Url or path to local file

    const asset = new TwAssetExtractor("skin", "https://api.skins.tw/database/skins/7n8qP5OyLUVwIB8q9hJaHvYAOArvsaMwtf2mWHDZ.png")

    try {
        await asset.preprocess()
        asset.extract("body", "foot")
        asset.setColor("255, 0, 0", "rgb", "body")
        asset.save("./tmp")
        asset.render("happy_eye")
        asset.saveRender("./tmp", "sheesh.png")
    } catch (err) {
        console.log(err)
    }
}

//extractTest()
ChangeTest()
//renderTest()
colorTest()
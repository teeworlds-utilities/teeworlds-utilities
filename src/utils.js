const fs = require("fs")

const saveInDir = (dirname, filename, canvas) => {
    // Create directory if it doesnt exist
    if (!fs.existsSync(dirname))
        fs.mkdirSync(dirname)

    // Save the element, only PNGs
    const buffer = canvas.toBuffer("image/png")
    fs.writeFileSync(`${dirname}/${filename}`, buffer)
}

module.exports = {
    saveInDir
}
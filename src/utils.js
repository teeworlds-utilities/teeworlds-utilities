const fs = require("fs")

const saveInDir = (dirname, filename, canvas) => {
    // Create directory if it doesnt exist
    if (!fs.existsSync(dirname))
        fs.mkdirSync(dirname)

    // Save the element, only PNGs
    const buffer = canvas.toBuffer("image/png")
    fs.writeFileSync(`${dirname}/${filename}`, buffer)
}

const isDigit = (str) =>
{
    for (const char of str) {
        if ("1234567890".includes(char) == false)
            return (false)
    }
    return (true)
}

const genChunks = (src, size) =>
{
    var ret = []

    for (var i = 0; i < src.length; i += size)
        ret.push(src.slice(i, i + size))
    return (ret)
}

module.exports = {
    saveInDir,
    isDigit,
    genChunks
}
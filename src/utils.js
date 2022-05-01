const fs = require("fs")

const saveInDir = (dirname, filename, canvas) =>
{
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

const closestNumber = (n, m) =>
{
    const q = Math.floor(n / m)
    const n1 = m * q
    var n2

    if ((n * m) > 0) {
        n2 = m * (q + 1)
    } else {
        n2 = m * (q - 1)
    }
    if (Math.abs(n - n1) < Math.abs(n - n2))
        return (n1)
    return (n2)
}

module.exports = {
    saveInDir,
    isDigit,
    genChunks,
    closestNumber
}
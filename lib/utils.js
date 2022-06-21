const fs = require("fs")
const { createCanvas, loadImage } = require("canvas")
const { InvalidFile } = require("./error")

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
        if ("1234567890".includes(char) === false)
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

const listFile = (path) =>
{
    var ret = fs.readdirSync(path, function (err) {
        if (err)
            throw err
    })

    return (ret)
}

const getCanvasFromFile = async (path) =>
{
    var img, canvas, ctx

    // Load image
    try {
        img = await loadImage(path)
    } catch (err) {
        throw (new InvalidFile("Unable to get the image " + path))
    }
    
    // If everything is OK, it creates the canvas and the context
    canvas = createCanvas(img.width, img.height)
    ctx = canvas.getContext("2d")
    ctx.drawImage(img, 0, 0)
    return (canvas)
}

const argsChecker = (args, ...neededArgs) =>
{
    if (!args)
        return (false)

    for (const arg of args) {
        if (neededArgs.includes(arg) === false) {
            return (false)
        }
    }
    return (true)
}
const roundRect = (ctx, r, w, h, color) =>
{
    ctx.beginPath();

    ctx.moveTo(w, h);
    ctx.arcTo(0, h, 0, 0, r);
    ctx.arcTo(0, 0, w, 0, r);
    ctx.arcTo(w, 0, w, h, r);
    ctx.arcTo(w, h, 0, h, r);
    
    ctx.fillStyle = color
    ctx.fill();
}

module.exports = {
    saveInDir,
    isDigit,
    genChunks,
    closestNumber,
    listFile,
    getCanvasFromFile,
    argsChecker,
    roundRect
}

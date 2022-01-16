const { InvalidColor } = require("./error")
const { isDigit, genChunks } = require("./utils")

class Color
{
    constructor (r, g, b, a=255)
    {
        this.r = r
        this.g = g
        this.b = b
        this.a = a
    }
}

const rgbHslFormat = (color) =>
{
    const sColor = color.split(",")
    
    if (sColor.length < 3 || sColor.length > 4)
        throw (new InvalidColor("Mininum and maximum elements: 3 and 4"))

    for (var i = 0; i < sColor.length; i++) {
        var value = sColor[i].match(/\d+/)
        if (!value)
            throw (new InvalidColor("Invalid RGB/HSL color format " + color +
            "\nValid format: \"255, 0, 12\" or \"255, 0, 12, 255\""))
        value = parseInt(value)
        sColor[i] = value
    }
    return (sColor)
}

const codeFormat = (color) =>
{
    if (isDigit(color) == false)
        throw (new InvalidColor("Invalid code format" + color +
        "\nValid format: an integer (min: 0, max: 0xffffff)"))

    color = parseInt(color).toString(16)
    const l = color.length
    if (l < 6)
        color = "0".repeat(6 - l) + color
    color = genChunks(color, 2).map(x => parseInt(x, 16))
    color[0] = (color[0] * 360) / 255
    color[1] = (color[1] * 100) / 255
    color[2] = ((color[2] / 2 + 128) * 100) / 255
    return (color)
}

const COLOR_FORMAT = {
    "rgb": rgbHslFormat,
    "hsl": rgbHslFormat,
    "code": codeFormat
}

const blackAndWhite = (pixel, _) =>
{
    const newValue = (pixel.r + pixel.g + pixel.b) / 3

    pixel.r = newValue
    pixel.g = newValue
    pixel.b = newValue
}

const defaultOp = (pixel, color) =>
{
    blackAndWhite(pixel, color)
    pixel.r = (pixel.r * color.r) / 255
    pixel.g = (pixel.g * color.g) / 255
    pixel.b = (pixel.b * color.b) / 255
    pixel.a = (pixel.a * color.a) / 255
}

const COLOR_MODE = {
    "default": defaultOp
}

module.exports = {
    COLOR_MODE,
    COLOR_FORMAT,
    Color
}
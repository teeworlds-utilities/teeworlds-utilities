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

const rgbFormat = (color) =>
{
    const sColor = color.split(",")
    
    if (sColor.length < 3 || sColor.length > 4)
        throw (new InvalidColor("Mininum and maximum elements: 3, 4"))

    for (var i = 0; i < sColor.length; i++) {
        var value = sColor[i].match(/\d+/)
        if (!value)
            throw (new InvalidColor("Invalid RGB color format " + color +
            "\nValid format: \"255, 0, 12\" or \"255, 0, 12, 255\""))
        value = parseInt(value)
        if (value < 0 || value > 255)
            throw (new InvalidColor(`RGB color ${value} is not between 0 and 255`))
        sColor[i] = value
    }
    return (sColor)
}

const hslFormat = (color) =>
{
    const sColor = color.split(",")
    const limits = [360, 100, 100, 255]
    var limit
    
    if (sColor.length < 3 || sColor.length > 4)
        throw (new InvalidColor("Mininum and maximum elements: 3, 4"))

    for (var i = 0; i < sColor.length; i++) {
        var value = sColor[i].match(/\d+/)
        if (!value)
            throw (new InvalidColor("Invalid HSL color format " + color +
            "\nValid format: \"360, 100, 100\" or \"123, 12, 12, 255\""))
        value = parseInt(value)
        limit = limits[i]
        if (value < 0 || value > limit)
            throw (new InvalidColor(`RGB color ${value} is not between 0 and ${limit}`))
        sColor[i] = value
    }
    return (sColor)
}

// Convert a color code to HSL format
const codeFormat = (color) =>
{
    if (isDigit(color) == false)
        throw (new InvalidColor("Invalid code format " + color +
        "\nValid format: A value encoded on 6 bytes"))

    color = parseInt(color)
    if (color < 0 || color > 0xffffff)
        throw (new InvalidColor("Invalid value " + color +
        "\nValid format: an integer (min: 0, max: 0xffffff)"))
    color = color.toString(16)
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
    "rgb": rgbFormat,
    "hsl": hslFormat,
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
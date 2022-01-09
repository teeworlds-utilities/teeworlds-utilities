class Color
{
    constructor (r, g, b, a=255)
    {
        this.r = r
        this.g = g
        this.b = b
        this.a = a
    }
    
    // Reverse with RGB
    getHSL ()
    {
        // TODO
    }
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
    Color
}
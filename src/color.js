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

const defaultOp = (pixel, color) => {
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
const data = require("./data")
const { InvalidFile, InvalidAsset, InvalidElement, InvalidColor } = require("./error")
const { saveInDir } = require("./utils")
const { COLOR_MODE, COLOR_FORMAT, Color } = require("./color")

const { loadImage, createCanvas } = require("canvas")
const convert = require("color-convert")

class TwElement
{
    constructor (name, imgData)
    {
        this.name = name
        this.imgData = imgData
        this.canvas = createCanvas(imgData.width, imgData.height)
        this.ctx = this.canvas.getContext("2d")
    }

    setColor (color, mode)
    {
        var buffer = this.imgData.data
        var r, g, b, a, pixel

        if (Object.keys(COLOR_MODE).includes(mode) == false)
            throw (new InvalidColor("This color mode doesn't exist " + mode))

        for (var byte = 0; byte < buffer.length; byte += 4) {
            // Get pixel
            r = buffer[byte]
            g = buffer[byte + 1]
            b = buffer[byte + 2]
            a = buffer[byte + 3]

            // Overwriting the pixel
            pixel = new Color(r, g, b, a)
            COLOR_MODE[mode](pixel, color)

            // Replace the pixel in the buffer
            buffer[byte] = pixel.r
            buffer[byte + 1] = pixel.g
            buffer[byte + 2] = pixel.b
            buffer[byte + 3] = pixel.a
        }
        // Apply new buffer to the canvas
        this.setCanvas()
    }

    setCanvas ()
    {
        this.ctx.putImageData(this.imgData, 0, 0)
    }

    save (dirname)
    {
        saveInDir(dirname, this.name + ".png", this.canvas)
    }
}

class TwAssetBase
{
    constructor (type, path)
    {
        this.type = type.toUpperCase()
        this.path = path

        this.elements
        this.img
        this.rCanvas
        this.canvas
        this.ctx
        this.data
    }

    async changeSrc (filename)
    {
        this.path = filename
        await this.preprocess()
    }

    async preprocess ()
    {
        // Check the asset type
        if (Object.keys(data).includes(this.type) == false)
            throw (new InvalidAsset("Invalid asset type " + this.type))
        this.data = data[this.type]
        
        // Load image
        try {
            this.img = await loadImage(this.path)
        } catch (err) {
            throw (new InvalidFile("Unable to get the image " + this.path))
        }
        
        // Check the image size
        if (this._isRatioLegal() == false)
            throw (new InvalidFile("Wrong image ratio " + this.path))
        
        // If everything is OK, it creates the canvas and the context
        this.canvas = createCanvas(this.img.width, this.img.height)
        this.ctx = this.canvas.getContext("2d")
        this.ctx.drawImage(this.img, 0, 0)
        this.elements = {}
    }

    _isRatioLegal ()
    {
        const ratio = this.data.size.w / this.data.size.h

        return (this.img.width / this.img.height == ratio)
    }

    _getMultiplier ()
    {
        return (this.img.width / this.data.size.w)
    }

    _isCut (name)
    {
        return (Object.keys(this.elements).includes(name))
    }

    _cut (name)
    {
        if (Object.keys(this.data.elements).includes(name) == false)
            throw (new InvalidElement("Unauthorized element type " + name))
        if (this._isCut(name))
            return (this.elements[name])

        const m = this._getMultiplier()
        const d = this.data.elements[name].map(x => x * m)
        const imgData = this.ctx.getImageData(d[0], d[1], d[2], d[3])

        // Generate an object with the cut area data
        var element = new TwElement(name, imgData)
        element.setCanvas()

        return (element)
    }

    extract (...names)
    {
        for (const name of names) {
            const element = this._cut(name)
            this.elements[name] = element
        }
    }

    extractAll ()
    {
        for (const name of Object.keys(this.data.elements)) {
            const element = this._cut(name)
            this.elements[name] = element
        }
    }

    _getColorArg(color, standard)
    {
        if (Object.keys(COLOR_FORMAT).includes(standard) == false)
            throw (new InvalidColor("Invalid color format: " + standard +
            "\nValid formats : rgb, hsl, code"))

        color = COLOR_FORMAT[standard](color)
        return (color)
    }

    // Only handling HSL format
    _colorLimitForSkin (color, limit = 52.5)
    {    
        if (color[2] < limit)
            color[2] = limit
        return (color)
    }

    _colorConvert (color, standard)
    {
        color = this._getColorArg(color, standard)
        var rgbFormat

        if (standard == "rgb") { 
            rgbFormat = color
            color = convert.rgb.hsl(...color)
        } else {
            rgbFormat = convert.hsl.rgb(...color)
        }
        if (this.type != "SKIN")
            return (new Color(...rgbFormat))

        // Preventing full black or full white skins
        color = this._colorLimitForSkin(color)

        // Convert to RGB to apply the color
        color = convert.hsl.rgb(...color)
        return (new Color(...color))
    }

    setColor (color, standard, ...names)
    {
        color = this._colorConvert(color, standard)
        
        for (const name of names) {
            if (Object.keys(this.elements).includes(name) == false)
                throw (new InvalidElement("Element has never been extracted " + name))
            this.elements[name].setColor(color, "default")
        }
    }

    setColorAll (color, standard)
    {
        this.setColor(color, standard, ...Object.keys(this.elements))
    }

    render (eye="default_eye")
    {
        if (this.type != "SKIN")
            throw (new InvalidAsset("You can't render the asset " + this.type))

        this.extract("body", "body_shadow", "foot", "foot_shadow", eye)
            
        var c
        const m = this._getMultiplier()
        const rCanvas = createCanvas(
            this.elements["body"].canvas.width + (12 * m),
            this.elements["body"].canvas.height + (12 * m)
        )
        const rCtx = rCanvas.getContext("2d")
        const cx = (6 * m)

        c = this.elements["foot_shadow"].canvas
        rCtx.drawImage(c, 0, 0, c.width, c.height, -cx + 2 * m, cx + 45 * m, c.width * 1.430, c.height * 1.450)
        c = this.elements["body_shadow"].canvas
        rCtx.drawImage(c, 0, 0, c.width, c.height, -cx + 12 * m, cx + 0 * m, c.width, c.height)
        c = this.elements["foot"].canvas
        rCtx.drawImage(c, 0, 0, c.width, c.height, -cx + 2 * m, cx + 45 * m, c.width * 1.430, c.height * 1.450)
        c = this.elements["foot_shadow"].canvas
        rCtx.drawImage(c, 0, 0, c.width, c.height, -cx + 24 * m, cx + 45 * m, c.width * 1.430, c.height * 1.450)
        c = this.elements["body"].canvas
        rCtx.drawImage(c, 0, 0, c.width, c.height, -cx + 12 * m, cx + 0 * m, c.width, c.height)
        c = this.elements["foot"].canvas
        rCtx.drawImage(c, 0, 0, c.width, c.height, -cx + 24 * m, cx + 45 * m, c.width * 1.430, c.height * 1.450)
        c = this.elements[eye].canvas
        rCtx.drawImage(c, 0, 0, c.width, c.height, -cx + 49.5 * m, cx + 23 * m, c.width * 1.15, c.height * 1.22)
        c = this.elements[eye].canvas
        rCtx.save()
        rCtx.scale(-1, 1)
        rCtx.drawImage(c, 0, 0, c.width, c.height, cx + -98 * m, cx + 23 * m, c.width * 1.15, c.height * 1.22)
        rCtx.restore()

        this.rCanvas = rCanvas
    }

    saveRender (dirname, name)
    {
        const filename = name || this.path.split("/").pop()
        if (!this.rCanvas)
            return (84)

        saveInDir(dirname, "render_" + filename, this.rCanvas)
    }

    async setHat (path = "./data/xmas_hat.png", sx = 0, sy = 0, size = 128)
    {
        const eKeys = Object.keys(this.elements)
        if (this.name != "SKIN" && (!eKeys.includes("body") || !eKeys.includes("body_shadow")))
            throw (new InvalidAsset("Only available for skin and you must extract body and body_shadow"))

        // The ideal size for a hat is the same as the one of the body,
        // it is also possible to make several frames in a single 
        // image as data/xmas_hat.png

        const body = this.elements.body
        const bodyS = this.elements.body_shadow

        try {
            const hat = await loadImage(path)
            const m = (body.canvas.width / size)
            
            // Add the hat
            body.ctx.drawImage(hat, sx, sy, size, size, 0, 0, size * m, size * m)
            const diff = parseInt(((size * m * 1.05) - (size * m)) / 2)

            // Add the hat to the shadow
            bodyS.ctx.drawImage(hat, sx, sy, size, size, -diff - 0.5, 
                -diff - 0.2, size * m * 1.05, size * m * 1.05)

            // Apply black color to the hat + shadow
            bodyS.ctx.globalCompositeOperation = "source-atop"
            bodyS.ctx.fillStyle = "black"
            bodyS.ctx.fillRect(0, 0, bodyS.canvas.width, bodyS.canvas.height);

        } catch (err) {
            throw (new InvalidFile("Unable to get the image " + path))
        }
    }
}

class TwAssetExtractor extends TwAssetBase
{
    save (dirname)
    {
        for (const element of Object.values(this.elements))
            element.save(dirname)
    }
}

module.exports = {
    TwAssetBase,
    TwAssetExtractor
}
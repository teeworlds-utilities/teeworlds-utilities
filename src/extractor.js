const data = require("./data")
const { InvalidFile, InvalidAssetType, InvalidElementType } = require("./error")
const { saveInDir } = require("./utils")

const { loadImage, createCanvas } = require("canvas")

class TwElement
{
    constructor (name, imgData)
    {
        this.name = name
        this.imgData = imgData
        this.canvas = createCanvas(this.imgData.width, this.imgData.height)
    }

    setCanvas ()
    {
        const ctx = this.canvas.getContext("2d")

        ctx.putImageData(this.imgData, 0, 0)
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
            throw (new InvalidAssetType("Invalid asset type"))
        this.data = data[this.type]
        
        // Load image
        try {
            this.img = await loadImage(this.path)
        } catch (err) {
            throw (new InvalidFile("Unable to open the file"))
        }
        
        // Check the image size
        if (this._isRatioLegal() == false)
            throw (new InvalidFile("Wrong image ratio"))
        
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

    _cut (name, multiplier)
    {
        if (Object.keys(this.data.elements).includes(name) == false)
            throw (new InvalidElementType("Unauthorized element type"))
        if (this._isCut(name))
            return (this.elements[name])

        const m = multiplier || this._getMultiplier()
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

    render (eye="default_eye")
    {
        if (this.type != "SKIN")
            throw (new InvalidAssetType("You cant render the asset"))

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
        rCtx.drawImage(c, 0, 0, c.width, c.height, -cx + 6 * m, cx + 50 * m, c.width * 1.35, c.height * 1.35)
        c = this.elements["foot"].canvas
        rCtx.drawImage(c, 0, 0, c.width, c.height, -cx + 6 * m, cx + 50 * m, c.width * 1.35, c.height * 1.35)
        c = this.elements["body_shadow"].canvas
        rCtx.drawImage(c, 0, 0, c.width, c.height, -cx + 12 * m, cx + 0 * m, c.width, c.height)
        c = this.elements["foot_shadow"].canvas
        rCtx.drawImage(c, 0, 0, c.width, c.height, -cx + 28 * m, cx + 50 * m, c.width * 1.35, c.height * 1.35)
        c = this.elements["body"].canvas
        rCtx.drawImage(c, 0, 0, c.width, c.height, -cx + 12 * m, cx + 0 * m, c.width, c.height)
        c = this.elements["foot"].canvas
        rCtx.drawImage(c, 0, 0, c.width, c.height, -cx + 28 * m, cx + 50 * m, c.width * 1.35, c.height * 1.35)
        c = this.elements[eye].canvas
        rCtx.drawImage(c, 0, 0, c.width, c.height, -cx + 51 * m, cx + 29 * m, c.width * 1.05, c.height * 1.1)
        c = this.elements[eye].canvas
        rCtx.save()
        rCtx.scale(-1, 1)
        rCtx.drawImage(c, 0, 0, c.width, c.height, cx + -95 * m, cx + 29 * m, c.width * 1.05, c.height * 1.1)
        rCtx.restore()

        this.rCanvas = rCanvas
    }

    saveRender (dirname)
    {
        const filename = this.path.split("/").pop()
        if (!this.rCanvas)
            return (84)

        saveInDir(dirname, "render_" + filename, this.rCanvas)
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
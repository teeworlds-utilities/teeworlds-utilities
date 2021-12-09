const data = require("./data")
const { InvalidFile, InvalidAssetType, InvalidElementType } = require("./error")

const fs = require("fs")
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
        // Create directory if it doesnt exist
        if (!fs.existsSync(dirname))
            fs.mkdirSync(dirname)
        
        // Save the element
        const buffer = this.canvas.toBuffer('image/png')
        fs.writeFileSync(`${dirname}/${this.name}.png`, buffer)
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
        if (!this.data || !this.img)
            return (0)
    
        const ratio = this.data.size.w / this.data.size.h

        return (this.img.width / this.img.height == ratio)
    }

    _getMultiplier ()
    {
        if (!this.data || !this.img)
            return (0)

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
        for (const [name, _] of Object.entries(this.data.elements)) {
            const element = this._cut(name)
            this.elements[name] = element
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
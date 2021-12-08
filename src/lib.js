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
        this.elements = {}
        
        this.img
        this.canvas
        this.ctx
        this.data
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

    extractAll ()
    {
        for (const [name, _] of Object.entries(this.data.elements)) {
            const element = this._cut(name)
            this.elements[name] = element
        }
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
}

class TwAssetExtractor extends TwAssetBase
{
    save (dirname)
    {
        for (const element of Object.values(this.elements))
            element.save(dirname)
    }
}

class TwAssetChanger
{
    constructor (type, src, ...dests)
    {
        this.src = src
        this.dests = dests
        this.type = type.toUpperCase()
        this.data = data[this.type]
    }

    async preprocess ()
    {
        // Preprocess the source image
        this.src = new TwAssetBase(this.type, this.src)
        await this.src.preprocess()

        // Preprocess the destination images
        for (let i = 0; i < this.dests.length ; i++) {
            this.dests[i] = new TwAssetBase(this.type, this.dests[i])
            await this.dests[i].preprocess()
        }
    }

    change (...names)
    {
        const image = this.src.img
        for (const name of names) {
            
            if (Object.keys(this.data.elements).includes(name) == false)
                throw (new InvalidElementType("Unauthorized element type"))

            const d = this.data.elements[name]
            for (let i = 0; i < this.dests.length; i++) {
                // Get multipliers
                const dest_m = this.dests[i].img.width / image.width
                const src_m = this.src._getMultiplier()

                // Sources position
                const sx = d[0] * src_m
                const sy = d[1] * src_m

                // Source size
                const sw = d[2] * src_m
                const sh = d[3] * src_m

                // Destination position
                const dx = sx * dest_m
                const dy = sy * dest_m

                // Destination size
                const dw = sw * dest_m
                const dh = sh * dest_m
                // Apply
                this.dests[i].ctx.clearRect(dx, dy, dw, dh);
                this.dests[i].ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
            }
        }
    }
    
    save (dirname)
    {
        for (const dest of this.dests) {
            const filename = dest.path.split('/').pop()

            if (!fs.existsSync(dirname))
                fs.mkdirSync(dirname)
    
            const buffer = dest.canvas.toBuffer('image/png')
            fs.writeFileSync(`${dirname}/${filename}`, buffer)
        }
    }
}

module.exports = {
    TwAssetExtractor,
    TwAssetChanger
}
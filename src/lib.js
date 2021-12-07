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
    }

    save (dirname)
    {
        const canvas = createCanvas(this.imgData.width, this.imgData.height)
        const ctx = canvas.getContext("2d")
        
        // Create directory if it doesnt exist
        if (!fs.existsSync(dirname))
            fs.mkdirSync(dirname)
        
        // Draw the element
        ctx.putImageData(this.imgData, 0, 0)

        // Save the element
        const buffer = canvas.toBuffer('image/png')
        fs.writeFileSync(`${dirname}/${this.name}.png`, buffer)
    }

    replace (dst)
    {
        // TODO
    }
}

class TwAsset 
{
    constructor (path, type="SKIN")
    {
        this.type = type.toUpperCase()
        this.path = path
        this.elements = []

        this.img
        this.canvas
        this.ctx
        this.data
    }

    isSizeLegal ()
    {
        return (this.img.width / this.img.height == this.data.ratio)
    }

    
    _cutAll ()
    {
        for (const [k, v] of Object.entries(this.data.elements)) {
            const obj = this.ctx.getImageData(v[0], v[1], v[2], v[3])
            const element = new TwElement(k, obj)
            this.elements.push(element)
        }
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
        if (this.isSizeLegal() == false)
        throw (new InvalidFile("Wrong image size"))
        
        // If everything is OK, it creates the canvas and the context
        this.canvas = createCanvas(this.img.width, this.img.height)
        this.ctx = this.canvas.getContext("2d")
        this.ctx.drawImage(this.img, 0, 0)
    }
    
    extractAll (dirname)
    {
        this._cutAll()
        for (const element of this.elements)
        element.save(dirname)
    }

    extract (name, dirname)
    {
        if (Object.keys(this.data.elements).includes(name) == false)
            throw (new InvalidElementType("Unauthorized element type"))
    
        const d = this.data.elements[name]
        const obj = this.ctx.getImageData(d[0], d[1], d[2], d[3])
        const element = new TwElement(name, obj)

        element.save(dirname)
    }
}

class TwAssetMerge {
    // TODO
}

module.exports = {
    TwAsset,
    TwAssetMerge
}
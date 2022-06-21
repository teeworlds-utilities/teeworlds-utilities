const { TwAssetBase } = require("./asset")
const { saveInDir, closestNumber } = require("./utils")

const { createCanvas } = require("canvas")
const { InvalidAsset } = require("./error")

class TwAssetFix extends TwAssetBase
{
    constructor (type, src)
    {
        super(type, src)

        this.fixedWidth
        this.fixedHeight
        this.fixedCanvas
    }

    async preprocess ()
    {
        await super.preprocess(false)
    }

    _getFixedSize ()
    {
        var ret = true
        const divisorWidth = this.data.divisor.w
        const divisorHeight = this.data.divisor.h

        this.fixedWidth = closestNumber(this.img.width, divisorWidth)
        this.fixedHeight = closestNumber(this.img.height, divisorHeight)

        ret &= this.fixedWidth === this.img.width
        ret &= this.fixedHeight === this.img.height
        return (ret)
    }

    fix ()
    {
        if (this._getFixedSize() === true)
            throw (new InvalidAsset(`Already have a good format ${this.path}`))

        this.fixedCanvas = createCanvas(this.fixedWidth, this.fixedHeight)
        const ctx = this.fixedCanvas.getContext("2d")
        
        ctx.clearRect(0, 0, this.fixedWidth, this.fixedHeight)
        ctx.drawImage(
            this.canvas,
            0, 0,
            this.canvas.width, this.canvas.height,
            0, 0,
            this.fixedWidth, this.fixedHeight
        )
    }

    save (dirname, name)
    {
        const filename = name || this.path.split("/").pop()
    
        saveInDir(dirname, filename, this.fixedCanvas)
    }
}

module.exports = {
    TwAssetFix
}

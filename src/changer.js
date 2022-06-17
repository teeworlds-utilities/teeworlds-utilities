const { TwAssetBase } = require("./asset")
const { saveInDir } = require("./utils")
const { InvalidElement } = require("./error")

class TwAssetChanger extends TwAssetBase
{
    constructor (type, src, ...dests)
    {
        super(type, src)
        this.dests = dests
    }

    async preprocess ()
    {
        // Preprocess the source image
        await super.preprocess()

        // Preprocess the destination images
        for (let i = 0; i < this.dests.length ; i++) {
            this.dests[i] = new TwAssetBase(this.type, this.dests[i])
            await this.dests[i].preprocess()
        }
    }

    change (...names)
    {
        var sw, sh, dx, dy, dw, dh, size_m, pos_m, d, element

        for (const name of names) {
            if (Object.keys(this.elements).includes(name) == false)
                throw (new InvalidElement("Element has never been extracted " + name))
            d = this.data.elements[name]
            element = this.elements[name]
            for (var i = 0; i < this.dests.length; i++) {

                // Multipliers
                size_m = this.dests[i].img.width / this.img.width
                pos_m = this.dests[i]._getMultiplier()

                // Source
                sw = element.canvas.width
                sh = element.canvas.height
                
                // Destination
                dx = d[0] * pos_m
                dy = d[1] * pos_m
                dw = sw * size_m
                dh = sh * size_m

                // Apply
                this.dests[i].ctx.clearRect(dx, dy, dw, dh);
                this.dests[i].ctx.drawImage(element.canvas, 0, 0, sw, sh, dx, dy, dw, dh)
            }
        }

        return (this)
    }
    
    save (dirname, name)
    {
        for (const dest of this.dests) {
            const filename = name || dest.path.split("/").pop()
            saveInDir(dirname, filename, dest.canvas)
        }

        return (this)
    }
}

module.exports = {
    TwAssetChanger
}
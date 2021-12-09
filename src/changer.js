const { TwAssetBase } = require("./extractor")
const { saveInDir } = require("./utils")

class TwAssetChanger extends TwAssetBase
{
    constructor (type, src, ...dests)
    {
        super (type, src)
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
        var sx, sy, sw, sh, dx, dy, dw, dh, size_m, pos_m

        this.extract(...names)

        for (const [name, element] of Object.entries(this.elements)) {
            const d = this.data.elements[name]
            for (var i = 0; i < this.dests.length; i++) {

                size_m = this.dests[i].img.width / this.img.width
                pos_m = this.dests[i]._getMultiplier()

                // Sources position
                sx = 0
                sy = 0

                // Source size
                sw = element.canvas.width
                sh = element.canvas.height

                // Destination position
                dx = d[0] * pos_m
                dy = d[1] * pos_m

                // Destination size
                dw = sw * size_m
                dh = sh * size_m

                // Apply
                this.dests[i].ctx.clearRect(dx, dy, dw, dh);
                this.dests[i].ctx.drawImage(element.canvas, sx, sy, sw, sh, dx, dy, dw, dh)
            }
        }
    }
    
    save (dirname)
    {
        for (const dest of this.dests) {
            const filename = dest.path.split("/").pop()

            saveInDir(dirname, filename, dest.canvas)
        }
    }
}

module.exports = {
    TwAssetChanger
}
const fs = require("fs")

const { TwAssetBase } = require("./extractor")

class TwAssetChanger extends TwAssetBase
{
    constructor (type, src, ...dests)
    {
        super (type, src)
        this.dests = dests
    }

    async changeSrc (filename)
    {
        this.path = filename
        await super.preprocess()
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
        var sx, sy, sw, sh, dx, dy, dw, dh
        const image = this.img

        this.extract(...names)

        for (const [name, element] of Object.entries(this.elements)) {
            const d = this.data.elements[name]
            for (let i = 0; i < this.dests.length; i++) {
                const dest_m = this.dests[i].img.width / image.width

                // Sources position
                sx = d[0]
                sy = d[1]

                // Source size
                sw = element.canvas.width
                sh = element.canvas.height

                // Destination position
                dx = sx * dest_m
                dy = sy * dest_m

                // Destination size
                dw = sw * dest_m
                dh = sh * dest_m

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
    TwAssetChanger
}
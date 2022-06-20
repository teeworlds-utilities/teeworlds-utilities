const { TwAssetExtractor } = require("./asset")
const { InvalidFile, InvalidScene } = require("./error")
const { saveInDir, listFile } = require("./utils")

const { createCanvas, loadImage } = require("canvas")
const fs = require("fs");

const SCHEME_FIELDS = {
    "blocks": "actions",
}

const DEFAULT_W = 640
const DEFAULT_H = 384

class CanvasCache
{
    constructor ()
    {
        this.cache = {}
    }

    addCanvas (key, canvas)
    {
        if (this.getCanvas(key, canvas.width, canvas.heigth))
            return

        this.cache[key] = {
            canvas: canvas,
            ctx: canvas.getContext("2d")
        }
    }

    getCanvas (key, w, h)
    {
        if (Object.keys(this.cache).includes(key) == false)
            return (null)
        
        const canvas = this.cache[key]

        if (canvas.canvas.width != w && canvas.canvas.heigth !=h)
            return (null)
        
        return (canvas)
    }
}

class TwSceneBlock
{
    constructor (
        path,
        sx, sy, sw, sh,
        dx, dy, dw, dh
    )
    {
        this.path = path

        this.setSource(sx, sy, sw, sh)
        this.setDest(dx, dy, dw, dh)
    }

    setSource (x, y, w ,h)
    {
        this.sx = x
        this.sy = y
        this.sw = w
        this.sh = h
    }

    setDest (x, y, w ,h)
    {
        this.dx = x
        this.dy = y
        this.dw = w
        this.dh = h
    }

    drawImageParameters ()
    {
        var properties = Object.getOwnPropertyNames(this)
        
        properties = properties.filter(prop => prop != "path")
        properties = properties.map(prop => this[prop])

        return (properties)
    }
}

class TwSceneBlocks
{
    constructor ()
    {
        this.array = []
    }

    addBlock (
        mapresPath,
        sx, sy, sw, sh,
        dx, dy, dw, dh
    )
    {
        const block = new TwSceneBlock(
            mapresPath,
            sx, sy, sw, sh,
            dx, dy, dw, dh
        )

        this.array.push(block)
    }

    reset ()
    {
        this.array = []
    }

    // block is just a model that will be duplicate
    addLine (path, ssx, ssy, sx, sy, dx, dy, w, h)
    {
        if (sx == dx && sy == dy)
            throw (new InvalidScene("Wrong usage"))

        if (sx > dx && sy > dy)
            this.addLine(path, dx, dy, sx, sy, w, h)

        while (sx <= dx && sy <= dy) {
            this.addBlock(
                path,
                ssx, ssy, w, h,
                sx, sy, w, h
            )

            if (sx == dx && sy == dy)
                break
            if (sx < dx)
                sx += w
            if (sy < dy)
                sy += h
        }
    }

    setRandomBackground(sceneW = DEFAULT_W, sceneH = DEFAULT_H)
    {
        const path = "./data/scenes/backgrounds/"
        const backgrounds = listFile(path)
        const index = Math.floor(Math.random() * (backgrounds.length - 1))
        const background = path + backgrounds[index]


        this.addBlock(
            background,
            0, 0, 800, 256,
            0, 0, sceneW, sceneH
        )
    }

    setBackground (path, w, h, sceneW = DEFAULT_W, sceneH = DEFAULT_H)
    {
        this.addBlock(
            path,
            0, 0, w, h,
            0, 0, sceneW, sceneH
        )
    }
}

class TwSceneMaker
{
    constructor (w = DEFAULT_W, h = DEFAULT_H)
    {
        this.canvas = createCanvas(w, h)
        this.ctx = this.canvas.getContext("2d")

        this.blocks = new TwSceneBlocks()
        this.cache = new CanvasCache()

        this.resolveCallback = {
            "setRandomBackground": this.blocks,
            "setBackground": this.blocks,
            "addBlock": this.blocks,
            "addLine": this.blocks,
            "addTee": this
        }
    }

    _isValidMapres (img)
    {
        var ret = true
        
        ret &= img.width == 1024
        ret &= img.height == 1024

        return (ret)
    }

    async _getCanvasFromMapres (path)
    {
        var img, canvas, ctx

        // Load image
        try {
            img = await loadImage(path)
        } catch (err) {
            throw (new InvalidFile("Unable to get the image " + path))
        }
        
        // If everything is OK, it creates the canvas and the context
        canvas = createCanvas(img.width, img.height)
        ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0)

        return (canvas)
    }

    async getFromCache(block)
    {
        var canvas
        const canvasCache = this.cache.getCanvas(
            block.path,
            block.w,
            block.h
        )

        if (canvasCache != null) {
            canvas = canvasCache.canvas
        } else {
            canvas = await this._getCanvasFromMapres(block.path)
            this.cache.addCanvas(block.path, canvas)
        }

        return (canvas)
    }

    async drawBlocks ()
    {
        var canvas, params

        for (const block of this.blocks.array) {
            canvas = await this.getFromCache(block)
            params = block.drawImageParameters()

            this.ctx.drawImage(canvas, ...params)
        }
        this.blocks.reset()
    }

    saveScene (dirname, filename)
    {
        saveInDir(dirname, filename, this.canvas)
    }

    async addTee (path, dx, dy, dw, dh, eye)
    {
        const tee = new TwAssetExtractor("skin", path)

        try {
            await tee.preprocess()
            tee.render(eye)
        } catch (err) {
            console.log(err)
            return
        }

        this.pasteCanvas(tee.rCanvas, dx, dy, dw, dh)
    }

    // Scheme example in "./data/scenes/basic_grass.json"
    async renderFromScheme (scheme)
    {
        // Adding blocks
        var funcName, args, object
        for (const action of scheme[SCHEME_FIELDS["blocks"]]) {
            funcName = action["callback"]
            args = action["args"]

            if (Object.keys(this.resolveCallback).includes(funcName) == false)
                continue
            
            object = this.resolveCallback[funcName]

            if (object[funcName].constructor.name === "AsyncFunction") {
                await this.drawBlocks()
                await object[funcName](...args)
            } else {
                object[funcName](...args)
            }
        }
        await this.drawBlocks()
    }

    async renderFromFile (filepath)
    {
        const raw = fs.readFileSync(filepath)
        const scheme = JSON.parse(raw)

        await this.renderFromScheme(scheme)
    }

    pasteCanvas (canvas, dx, dy, dw, dh)
    {
        this.ctx.drawImage(
            canvas,
            0, 0, canvas.width, canvas.height,
            dx, dy, dw, dh
        )
    }
}

module.exports = {
    TwSceneMaker
}

const { TwAssetExtractor } = require("./asset")
const { InvalidScene } = require("./error")
const { saveInDir, listFile, getCanvasFromFile, argsChecker } = require("./utils")

const { createCanvas } = require("canvas")
const fs = require("fs");
const { waitForDebugger } = require("inspector");

class CanvasCache
{
    constructor ()
    {
        this.cache = {}
    }

    addCanvas (key, canvas)
    {
        if (this.getCanvas(key))
            return

        this.cache[key] = canvas
    }

    getCanvas (key)
    {
        if (Object.keys(this.cache).includes(key) === false)
            return (null)
        
        const canvas = this.cache[key]
        
        return (canvas)
    }
}

class Entity
{
    constructor (imgData)
    {
        this.imgData = imgData
        this.canvas = createCanvas(imgData.width, imgData.height)
        this.ctx = this.canvas.getContext("2d")
        
        this.fillCanvas()
    }

    fillCanvas ()
    {
        this.ctx.putImageData(this.imgData, 0, 0)
    }
}

class Part extends Entity
{
    constructor (imgData, destination)
    {
        super(imgData)
        this.destination = destination
    }
}

class Scheme
{
    static DEFAULT_KEYS = ["size", "actions"]

    constructor (path)
    {
        this.path = path
        this.data = undefined
    }

    _checkScheme ()
    {
        const args = Object.keys(this.data)

        if (argsChecker(args, ...Scheme.DEFAULT_KEYS) === false)
            throw (new InvalidScene("Missing arguments for the scheme"))
    }

    preprocess (scheme = null)
    {
        if (this.path) {
            this.dataFromFile(this.path)
        } else if (scheme) {
            this.data = scheme
        } else {
            throw (new InvalidScene("Missing scheme"))
        }

        this._checkScheme()
    }

    dataFromFile (filepath)
    {
        const raw = fs.readFileSync(filepath)
        const scheme = JSON.parse(raw)

        this.data = scheme

        return (this)
    }
}

class Action
{
    constructor (object, func, ...needArgs)
    {
        this.object = object
        this.func = func
        this.needArgs = needArgs
    }

    async call (args)
    {
        const argsNames = Object.keys(args)
        var argsGoodOrder = []

        if (argsChecker(this.needArgs, ...argsNames) === false)
            throw (new InvalidScene("Missing args"))
        
        for (const arg of this.needArgs) {
            argsGoodOrder.push(args[arg])
            delete args[arg]
        }

        const optionalsArgs = Object.values(args)
        
        await this.object[this.func](
            ...argsGoodOrder,
            ...optionalsArgs
        )
    }
}

class Actions
{
    constructor ()
    {
        this.actions = {}
    }

    add (name, object, func, ...needArgs)
    {
        const action = new Action(object, func, ...needArgs)
        this.actions[name] = action
    }

    get (name)
    {
        if (Object.keys(this.actions).includes(name) === false)
            return (null)
        
        return (this.actions[name])
    }

    async tryCall (name, args)
    {
        var action = this.get(name)

        if (action === null)
            return

        await action.call(args)
    }
}

class TwSceneMaker
{
    constructor (path)
    {
        this.canvas = undefined
        this.ctx = undefined
        
        this.cache = new CanvasCache()
        this.scheme = new Scheme(path)
        this.actions = new Actions()
        this.parts = []
    }

    preprocess (scheme = null)
    {
        // Get the scheme
        this.scheme.preprocess(scheme)

        // Add Action(s) in this.actions
        this.actions.add(
            "addLine",
            this, "addLine",
            "mapres", "source", "point_source", "point_destination"
        )

        this.actions.add(
            "addBlock",
            this, "addBlock",
            "mapres", "source", "destination"
        )

        this.actions.add(
            "setRandomBackground",
            this, "setRandomBackground"
        )

        this.actions.add(
            "addTee",
            this, "addTee",
            "skin", "destination"
        )
        
        this.actions.add(
            "setBackground",
            this, "setBackground",
            "image"
        )

        this.actions.add(
            "addSquare",
            this, "addSquare",
            "mapres", "source", "topLeft", "bottomRight"
        )

        // Init the scene canvas (with context)
        this.initCanvas()

        return (this)
    }

    initCanvas ()
    {
        const w = this.scheme.data["size"]["w"]
        const h = this.scheme.data["size"]["h"]

        this.canvas = createCanvas(w, h)
        this.ctx = this.canvas.getContext("2d")
    }

    saveScene (dirname, filename)
    {
        saveInDir(dirname, filename, this.canvas)

        return (this)
    }

    async execScheme ()
    {
        const actions = this.scheme.data["actions"]

        for (const action of actions) {
            if (argsChecker(Object.keys(action), "name", "args") === false)
                continue

            await this.actions.tryCall(
                action["name"],
                action["args"]
            )
        }

        return (this)
    }

    async renderScene ()
    {
        await this.execScheme()

        for (const part of this.parts) {
            this.ctx.drawImage(
                part.canvas,
                0, 0, part.canvas.width, part.canvas.height,
                ...part.destination
            )
        }
    }

    async addLine (mapres, source, point_source, point_destination)
    {
        var [sx, sy] = point_source
        var [dx, dy] = point_destination
        var [w, h] = source.slice(2, 4)
        var destination

        if (sx === dx && sy === dy)
            throw (new InvalidScene("Wrong usage"))

        if (sx > dx && sy > dy)
            this.addLine(
                mapres, source,
                point_destination, point_source
            )

        while (sx <= dx && sy <= dy) {
            destination = [sx, sy, w, h]
            await this.addBlock(
                mapres,
                source,
                destination
            )

            if (sx === dx && sy === dy)
                break
            if (sx < dx)
                sx += w
            if (sy < dy)
                sy += h
        }
    }

    async addBlock (mapres, source, destination)
    {
        const canvas = await this.getCanvasFromCache(mapres)
        const ctx = canvas.getContext("2d")
        const imgData = ctx.getImageData(...source)
        const part = new Part(imgData, destination)

        this.parts.push(part)
    }

    async addSquare (mapres, source, topLeft, bottomRight)
    {
        const [w, h] = source.slice(2, 4)
        var [sx, sy] = topLeft
        var [dx, dy] = bottomRight

        for (sy; sy < dy; sy += h) {
            for (let tmpSx = sx; tmpSx < dx; tmpSx += w) {
                await this.addBlock(
                    mapres,
                    source,
                    [tmpSx, sy, w, h]
                )
            }
        }
    }

    async setRandomBackground (bg_folder)
    {
        const path = bg_folder || "./data/scenes/backgrounds/"
        const backgrounds = listFile(path)
        const index = Math.floor(Math.random() * (backgrounds.length - 1))
        const background = path + backgrounds[index]

        await this.setBackground(
            background, 
            [
                this.scheme.data["size"]["w"],
                this.scheme.data["size"]["h"]
            ]
        )
    }

    async addTee (skin, destination)
    {
        const tee = new TwAssetExtractor("skin", skin)

        try {
            await tee.preprocess()
            tee.render()
        } catch (err) {
            console.log(err)
            return
        }

        const ctx = tee.rCanvas.getContext("2d")

        const imgData = ctx.getImageData(
            0, 0,
            tee.rCanvas.width, tee.rCanvas.height
        )
        const part = new Part(imgData, destination)
        this.parts.push(part)
    }

    async setBackground (image)
    {
        const canvas = await this.getCanvasFromCache(image)
        const ctx = canvas.getContext("2d")

        const imgData = ctx.getImageData(
            0, 0,
            canvas.width, canvas.height
        )
        const part = new Part(imgData, [
            0, 0,
            this.scheme.data["size"]["w"],
            this.scheme.data["size"]["h"]
        ])

        this.parts.push(part)
    }

    async getCanvasFromCache(path)
    {
        var canvas
        const canvasCache = this.cache.getCanvas(path)

        if (canvasCache != null) {
            canvas = canvasCache
        } else {
            canvas = await getCanvasFromFile(path)
            this.cache.addCanvas(path, canvas)
        }

        return (canvas)
    }
}

module.exports = {
    TwSceneMaker
}

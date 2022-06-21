const { createCanvas } = require("canvas")

function createCell(x, y, w, h, content)
{
    return ({
        x, y,
        w, h,
        content
    })
}

class CardTab
{
    constructor(xOffset, yOffset, wCell, hCell)
    {
        this.xOffset = xOffset
        this.yOffset = yOffset

        this.wCell = wCell
        this.hCell = hCell

        this.columns = {}
    }

    addColumn (title)
    {
        this.columns[title] = []
    }

    addContent (title, content)
    {
        if (Object.keys(this.columns).includes(title) === false)
            this.addColumn(title)

        var cell
        const columnLenght = this.columns[title].lenght

        if (columnLenght === 0) {
            cell = createCell(
                this.xOffset, this.yOffset,
                this.wCell, this.hCell,
                content
            )
        } else {

            const lastCell = this.columns[title][columnLenght - 1]

            cell = createCell(
                lastCell.x, lastCell.y,
                this.wCell, lastCell.h + this.hCell + 10, // -> spacing
                content
            )
        }
        this.columns[title].push(cell)
    }
}

class TwCardBase
{
    constructor (name, w, h)
    {
        this.name = name
        this.canvas = createCanvas(w, h)
        this.ctx = this.canvas.getContext("2d")
    }

    

}

class TwCard extends TwCardBase
{
    constructor (name)
    {
        super(name, 470, 190)
    }
}

class TwCardStats extends TwCardBase
{
    constructor (name)
    {
        super(name, 470, 420)
    }
}

module.exports = {
    TwCard,
    TwCardStats
}

class InvalidFile extends Error {
    constructor (msg) {
        super(msg)
        this.name = "InvalidFile"
    }
}

class InvalidAsset extends Error {
    constructor (msg) {
        super(msg)
        this.name = "InvalidAsset"
    }
}

class InvalidElement extends Error {
    constructor (msg) {
        super(msg)
        this.name = "InvalidElement"
    }
}

class InvalidColor extends Error {
    constructor (msg) {
        super(msg)
        this.name = "InvalidColor"
    }
}

module.exports = {
    InvalidFile,
    InvalidAsset,
    InvalidElement,
    InvalidColor
}
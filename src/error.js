class InvalidFile extends Error {
    constructor (msg) {
        super(msg)
        this.name = "InvalidFile"
    }
}

class InvalidAssetType extends Error {
    constructor (msg) {
        super(msg)
        this.name = "InvalidAssetType"
    }
}

class InvalidElementType extends Error {
    constructor (msg) {
        super(msg)
        this.name = "InvalidElementType"
    }
}


module.exports = {
    InvalidFile,
    InvalidAssetType,
    InvalidElementType
}
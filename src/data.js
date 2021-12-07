/*
Information about the values of the elements

[x, y, w, h]
(x, y) -> Position on the image, (0, 0) -> top left
(w, h) -> Size

The values have been inserted for the smallest model
of assets but they can be adapted for larger images 
(HD, 4K, etc...) thanks to the ratio.
*/


/*
Why the keys of elements are in Snake case ?

Because they are going to be use as filename.
*/

const SKIN = {
    "size": { "w": 256, "h": 128 },
    "elements": {
        "body": [0, 0, 96, 96],
        "body_shadow": [96, 0, 96, 96],
        "hand": [192, 0, 32, 32],
        "hand_shadow": [224, 0, 32, 32],
        "foot": [192, 32, 64, 32],
        "foot_shadow": [192, 64, 64, 32],
        "default_eye": [64, 96, 32, 32],
        "angry_eye": [96, 96, 32, 32],
        "blink_eye": [128, 96, 32, 32],
        "happy_eye": [160, 96, 32, 32],
        "cross_eye": [192, 96, 32, 32],
        "scary_eye": [224, 96, 32, 32]
    }
}

const GAMESKIN = {
    "ratio": 2,
    "elements": {
        "hammer_crosshair": [0, 0, 64, 64]
    }
}

module.exports = {
    SKIN
}
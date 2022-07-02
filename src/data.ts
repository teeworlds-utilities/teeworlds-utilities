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
  size: {w: 256, h: 128},
  divisor: {w: 8, h: 4},
  elements: {
    body: [0, 0, 96, 96],
    body_shadow: [96, 0, 96, 96],
    hand: [192, 0, 32, 32],
    hand_shadow: [224, 0, 32, 32],
    foot: [192, 32, 64, 32],
    foot_shadow: [192, 64, 64, 32],
    default_eye: [64, 96, 32, 32],
    angry_eye: [96, 96, 32, 32],
    blink_eye: [128, 96, 32, 32],
    happy_eye: [160, 96, 32, 32],
    cross_eye: [192, 96, 32, 32],
    scary_eye: [224, 96, 32, 32],
  },
};

const GAMESKIN = {
  size: {w: 1024, h: 512},
  divisor: {w: 32, h: 16},
  elements: {
    hook: [64, 0, 128, 32],
    hammer_cursor: [0, 0, 64, 64],
    gun_cursor: [0, 128, 64, 64],
    shotgun_cursor: [0, 192, 64, 64],
    grenade_cursor: [0, 256, 64, 64],
    ninja_cursor: [0, 320, 64, 64],
    laser_cursor: [0, 384, 64, 64],
    hammer: [64, 32, 128, 96],
    gun: [64, 128, 128, 64],
    shotgun: [64, 192, 256, 64],
    grenade: [64, 256, 256, 64],
    ninja: [64, 320, 256, 64],
    laser: [64, 384, 224, 96],
    gun_ammo: [192, 128, 64, 64],
    shotgun_ammo: [320, 192, 64, 64],
    grenade_ammo: [320, 256, 64, 64],
    laser_ammo: [320, 384, 64, 64],
    gun_particle_1: [256, 128, 128, 64],
    gun_particle_2: [384, 128, 128, 64],
    gun_particle_3: [512, 128, 128, 64],
    shotgun_particle_1: [384, 192, 128, 64],
    shotgun_particle_2: [512, 192, 128, 64],
    shotgun_particle_3: [640, 192, 128, 64],
    particle_1: [192, 0, 32, 32],
    particle_2: [224, 0, 32, 32],
    particle_3: [256, 0, 32, 32],
    particle_4: [192, 32, 32, 32],
    particle_5: [224, 32, 32, 32],
    particle_6: [256, 32, 32, 32],
    particle_7: [288, 0, 64, 64],
    particle_8: [352, 0, 64, 64],
    particle_9: [416, 0, 64, 64],
    star_1: [480, 0, 64, 64],
    star_2: [544, 0, 64, 64],
    star_3: [608, 0, 64, 64],
    health_full: [672, 0, 64, 64],
    health_empty: [736, 0, 64, 64],
    armor_full: [672, 64, 64, 64],
    armor_empty: [736, 64, 64, 64],
    heart: [320, 64, 64, 64],
    shield: [384, 64, 64, 64],
    minus: [256, 64, 64, 64],
    ninja_timer: [672, 128, 128, 64],
    ninja_particle_1: [800, 0, 224, 128],
    ninja_particle_2: [800, 128, 224, 128],
    ninja_particle_3: [800, 256, 224, 128],
    flag_blue: [384, 256, 128, 256],
    flag_red: [512, 256, 128, 256],
  },
};

const EMOTICON = {
  size: {w: 512, h: 512},
  divisor: {w: 4, h: 4},
  elements: {
    1: [0, 0, 128, 128],
    2: [128, 0, 128, 128],
    3: [256, 0, 128, 128],
    4: [384, 0, 128, 128],
    5: [0, 128, 128, 128],
    6: [128, 128, 128, 128],
    7: [256, 128, 128, 128],
    8: [384, 128, 128, 128],
    9: [0, 256, 128, 128],
    10: [128, 256, 128, 128],
    11: [256, 256, 128, 128],
    12: [384, 256, 128, 128],
    13: [0, 384, 128, 128],
    14: [128, 384, 128, 128],
    15: [256, 384, 128, 128],
    16: [384, 384, 128, 128],
  },
};

const PARTICULE = {
  size: {w: 512, h: 512},
  divisor: {w: 8, h: 8},
  elements: {
    1: [0, 0, 64, 64],
    2: [64, 0, 64, 64],
    3: [128, 0, 64, 64],
    4: [192, 0, 64, 64],
    5: [256, 0, 64, 64],
    6: [0, 64, 64, 64],
    7: [64, 64, 64, 64],
    8: [128, 64, 64, 64],
    9: [192, 64, 64, 64],
    10: [256, 64, 128, 128],
    11: [0, 128, 128, 128],
    12: [128, 128, 128, 128],
    13: [0, 256, 256, 256],
  },
};

export {SKIN, GAMESKIN, EMOTICON, PARTICULE};

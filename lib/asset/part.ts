import { AssetPartError } from "../error";
import { Position } from "./base";

export enum AssetHelpSize {
  MINI = 0.5,
  DEFAULT = 1,
  MINI_HD = 2,
  HD = 4,
  FOUR_K = 8
}

export interface IAssetPartMetadata {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * The function scales the dimensions of an asset part metadata object by a given
 * multiplier.
 * @param {IAssetPartMetadata} metadata - An object of type IAssetPartMetadata that
 * contains information about the position and size of an asset part. It has the
 * following properties:
 * @param {number} multiplier - The multiplier is a number that is used to scale
 * the values of the x, y, w, and h properties of the metadata object. It
 * determines how much the values should be increased or decreased. For example, if
 * the multiplier is 2, the values of x, y, w, and
 * @returns an object of type `IAssetPartMetadata` with the `x`, `y`, `w`, and `h`
 * properties scaled by the `multiplier` parameter.
 */
export function scaleMetadata(
  metadata: IAssetPartMetadata,
  multiplier: number
): IAssetPartMetadata {
  return {
    x: metadata.x * multiplier,
    y: metadata.y * multiplier,
    w: metadata.w * multiplier,
    h: metadata.h * multiplier
  }
}

export type AssetPart =
  | SkinPart
  | GameskinPart
  | EmoticonPart
  | ParticulePart

export enum SkinPart {
  BODY = "body",
  BODY_SHADOW = "body_shadow",
  HAND = "hand",
  HAND_SHADOW = "hand_shadow",
  FOOT = "foot",
  FOOT_SHADOW = "foot_shadow",
  DEFAULT_EYE = "default_eye",
  ANGRY_EYE = "angry_eye",
  PAIN_EYE = "pain_eye",
  HAPPY_EYE = "happy_eye",
  CROSS_EYE = "cross_eye",
  SCARY_EYE = "scary_eye",
  BLINK_EYE = "blink_eye",
}

export type EyeSkinPart = 
  | SkinPart.DEFAULT_EYE
  | SkinPart.ANGRY_EYE
  | SkinPart.PAIN_EYE
  | SkinPart.HAPPY_EYE
  | SkinPart.CROSS_EYE
  | SkinPart.SCARY_EYE
  // Special case
  | SkinPart.BLINK_EYE

export const BLINK_SCALE = 0.35;

export enum GameskinPart {
  HOOK = "hook",
  HAMMER_CURSOR = "hammer_cursor",
  GUN_CURSOR = "gun_cursor",
  SHOTGUN_CURSOR = "shotgun_cursor",
  GRENADE_CURSOR = "grenade_cursor",
  NINJA_CURSOR = "ninja_cursor",
  LASER_CURSOR = "laser_cursor",
  HAMMER = "hammer",
  GUN = "gun",
  SHOTGUN = "shotgun",
  GRENADE = "grenade",
  NINJA = "ninja",
  LASER = "laser",
  GUN_AMMO = "gun_ammo",
  SHOTGUN_AMMO = "shotgun_ammo",
  GRENADE_AMMO = "grenade_ammo",
  LASER_AMMO = "laser_ammo",
  GUN_PARTICLE_1 = "gun_particle_1",
  GUN_PARTICLE_2 = "gun_particle_2",
  GUN_PARTICLE_3 = "gun_particle_3",
  SHOTGUN_PARTICLE_1 = "shotgun_particle_1",
  SHOTGUN_PARTICLE_2 = "shotgun_particle_2",
  SHOTGUN_PARTICLE_3 = "shotgun_particle_3",
  PARTICLE_1 = "particle_1",
  PARTICLE_2 = "particle_2",
  PARTICLE_3 = "particle_3",
  PARTICLE_4 = "particle_4",
  PARTICLE_5 = "particle_5",
  PARTICLE_6 = "particle_6",
  PARTICLE_7 = "particle_7",
  PARTICLE_8 = "particle_8",
  PARTICLE_9 = "particle_9",
  STAR_1 = "star_1",
  STAR_2 = "star_2",
  STAR_3 = "star_3",
  HEALTH_FULL = "health_full",
  HEALTH_EMPTY = "health_empty",
  ARMOR_FULL = "armor_full",
  ARMOR_EMPTY = "armor_empty",
  HEART = "heart",
  SHIELD = "shield",
  MINUS = "minus",
  NINJA_TIMER = "ninja_timer",
  NINJA_PARTICLE_1 = "ninja_particle_1",
  NINJA_PARTICLE_2 = "ninja_particle_2",
  NINJA_PARTICLE_3 = "ninja_particle_3",
  FLAG_BLUE = "flag_blue",
  FLAG_RED = "flag_red",
}

export type WeaponGameSkinPart = 
  | GameskinPart.HAMMER
  | GameskinPart.GUN
  | GameskinPart.SHOTGUN
  | GameskinPart.GRENADE
  | GameskinPart.NINJA
  | GameskinPart.LASER

export enum EmoticonPart {
  PART_1_1 = "part_1_1",
  PART_1_2 = "part_1_2",
  PART_1_3 = "part_1_3",
  PART_1_4 = "part_1_4",
  PART_2_1 = "part_2_1",
  PART_2_2 = "part_2_2",
  PART_2_3 = "part_2_3",
  PART_2_4 = "part_2_4",
  PART_3_1 = "part_3_1",
  PART_3_2 = "part_3_2",
  PART_3_3 = "part_3_3",
  PART_3_4 = "part_3_4",
  PART_4_1 = "part_4_1",
  PART_4_2 = "part_4_2",
  PART_4_3 = "part_4_3",
  PART_4_4 = "part_4_4",
}

export enum ParticulePart {
  SMALL_1 = "small_1",
  SMALL_2 = "small_2",
  SMALL_3 = "small_3",
  SMALL_4 = "small_4",
  SMALL_5 = "small_5",
  SMALL_6 = "small_6",
  SMALL_7 = "small_7",
  SMALL_8 = "small_8",
  SMALL_9 = "small_9",
  MID_1 = "mid_1",
  MID_2 = "mid_2",
  MID_3 = "mid_3",
  BIG = "big",
}

export enum AssetKind{
  SKIN = "skin",
  GAMESKIN = "gameskin",
  EMOTICON = "emoticon",
  PARTICULE = "particule",
  UNKNOWN = "unknown"
}

export interface ITeeHandMetadata extends Position {
  angle: number;
}

export interface ITeeWeaponMetadata {
  hand: ITeeHandMetadata;
  move: Position;
  scaleFactor: number;
}

const EYES_FROM_EMOTICON: Record<EmoticonPart, EyeSkinPart> = {
  [EmoticonPart.PART_1_1]: SkinPart.PAIN_EYE,
  [EmoticonPart.PART_1_2]: SkinPart.SCARY_EYE,
  [EmoticonPart.PART_1_3]: SkinPart.HAPPY_EYE,
  [EmoticonPart.PART_1_4]: SkinPart.BLINK_EYE,
  [EmoticonPart.PART_2_1]: SkinPart.BLINK_EYE,
  [EmoticonPart.PART_2_2]: SkinPart.HAPPY_EYE,
  [EmoticonPart.PART_2_3]: SkinPart.PAIN_EYE,
  [EmoticonPart.PART_2_4]: SkinPart.SCARY_EYE,
  [EmoticonPart.PART_3_1]: SkinPart.ANGRY_EYE,
  [EmoticonPart.PART_3_2]: SkinPart.ANGRY_EYE,
  [EmoticonPart.PART_3_3]: SkinPart.ANGRY_EYE,
  [EmoticonPart.PART_3_4]: SkinPart.ANGRY_EYE,
  [EmoticonPart.PART_4_1]: SkinPart.BLINK_EYE,
  [EmoticonPart.PART_4_2]: SkinPart.SCARY_EYE,
  [EmoticonPart.PART_4_3]: SkinPart.HAPPY_EYE,
  [EmoticonPart.PART_4_4]: SkinPart.SCARY_EYE,
}

export function getEyesFromEmoticon(emoticonPart: EmoticonPart): EyeSkinPart {
  return EYES_FROM_EMOTICON[emoticonPart];
}

// first and second represents the tee hand.
// Their position is relative to the weapons the tee holds.
export const TEE_WEAPON_METADATA: Record<WeaponGameSkinPart, ITeeWeaponMetadata> = {
  [GameskinPart.HAMMER]: {
    scaleFactor: 0.88,
    move: { x: 20, y: -15 },
    hand: { x: -100, y: -100, angle: 0 },
  },
  [GameskinPart.GUN]: {
    scaleFactor: 0.75,
    move: { x: 53, y: 10},
    hand: { x: 10, y: 17, angle: 220 },
  },
  [GameskinPart.SHOTGUN]: {
    scaleFactor: 0.58,
    move: { x: 38, y: 0 },
    hand: { x: 54, y: 10, angle: 270 },
  },
  [GameskinPart.GRENADE]: {
    scaleFactor: 0.6,
    move: { x: 40, y: 0 },
    hand: { x: 54, y: 13, angle: 270 },
  },
  [GameskinPart.LASER]: {
    scaleFactor: 0.6,
    move: { x: 37, y: 5 },
    hand: { x: -100, y: -100, angle: 0 },
  },
  [GameskinPart.NINJA]: {
    scaleFactor: 0,
    move: { x: 0, y: 0 },
    hand: { x: 0, y: 0, angle: 0 },
  },
}

const ASSET_PARTS: Record<AssetKind, Record<string, IAssetPartMetadata>> = {
  [AssetKind.SKIN]: {
    [SkinPart.BODY]: { x: 0, y: 0, w: 96, h: 96 },
    [SkinPart.BODY_SHADOW]: { x: 96, y: 0, w: 96, h: 96 },
    [SkinPart.HAND]: { x: 192, y: 0, w: 32, h: 32 },
    [SkinPart.HAND_SHADOW]: { x: 224, y: 0, w: 32, h: 32 },
    [SkinPart.FOOT]: { x: 192, y: 32, w: 64, h: 32 },
    [SkinPart.FOOT_SHADOW]: { x: 192, y: 64, w: 64, h: 32 },
    [SkinPart.DEFAULT_EYE]: { x: 64, y: 96, w: 32, h: 32 },
    [SkinPart.ANGRY_EYE]: { x: 96, y: 96, w: 32, h: 32 },
    [SkinPart.PAIN_EYE]: { x: 128, y: 96, w: 32, h: 32 },
    [SkinPart.HAPPY_EYE]: { x: 160, y: 96, w: 32, h: 32 },
    [SkinPart.CROSS_EYE]: { x: 192, y: 96, w: 32, h: 32 },
    [SkinPart.SCARY_EYE]: { x: 224, y: 96, w: 32, h: 32 },
  },
  [AssetKind.GAMESKIN]: {
    [GameskinPart.HOOK]: { x: 64, y: 0, w: 128, h: 32 },
    [GameskinPart.HAMMER_CURSOR]: { x: 0, y: 0, w: 64, h: 64 },
    [GameskinPart.GUN_CURSOR]: { x: 0, y: 128, w: 64, h: 64 },
    [GameskinPart.SHOTGUN_CURSOR]: { x: 0, y: 192, w: 64, h: 64 },
    [GameskinPart.GRENADE_CURSOR]: { x: 0, y: 256, w: 64, h: 64 },
    [GameskinPart.NINJA_CURSOR]: { x: 0, y: 320, w: 64, h: 64 },
    [GameskinPart.LASER_CURSOR]: { x: 0, y: 384, w: 64, h: 64 },
    [GameskinPart.HAMMER]: { x: 64, y: 32, w: 128, h: 96 },
    [GameskinPart.GUN]: { x: 64, y: 128, w: 128, h: 64 },
    [GameskinPart.SHOTGUN]: { x: 64, y: 192, w: 256, h: 64 },
    [GameskinPart.GRENADE]: { x: 64, y: 256, w: 256, h: 64 },
    [GameskinPart.NINJA]: { x: 64, y: 320, w: 256, h: 64 },
    [GameskinPart.LASER]: { x: 64, y: 384, w: 224, h: 96 },
    [GameskinPart.GUN_AMMO]: { x: 192, y: 128, w: 64, h: 64 },
    [GameskinPart.SHOTGUN_AMMO]: { x: 320, y: 192, w: 64, h: 64 },
    [GameskinPart.GRENADE_AMMO]: { x: 320, y: 256, w: 64, h: 64 },
    [GameskinPart.LASER_AMMO]: { x: 320, y: 384, w: 64, h: 64 },
    [GameskinPart.GUN_PARTICLE_1]: { x: 256, y: 128, w: 128, h: 64 },
    [GameskinPart.GUN_PARTICLE_2]: { x: 384, y: 128, w: 128, h: 64 },
    [GameskinPart.GUN_PARTICLE_3]: { x: 512, y: 128, w: 128, h: 64 },
    [GameskinPart.SHOTGUN_PARTICLE_1]: { x: 384, y: 192, w: 128, h: 64 },
    [GameskinPart.SHOTGUN_PARTICLE_2]: { x: 512, y: 192, w: 128, h: 64 },
    [GameskinPart.SHOTGUN_PARTICLE_3]: { x: 640, y: 192, w: 128, h: 64 },
    [GameskinPart.PARTICLE_1]: { x: 192, y: 0, w: 32, h: 32 },
    [GameskinPart.PARTICLE_2]: { x: 224, y: 0, w: 32, h: 32 },
    [GameskinPart.PARTICLE_3]: { x: 256, y: 0, w: 32, h: 32 },
    [GameskinPart.PARTICLE_4]: { x: 192, y: 32, w: 32, h: 32 },
    [GameskinPart.PARTICLE_5]: { x: 224, y: 32, w: 32, h: 32 },
    [GameskinPart.PARTICLE_6]: { x: 256, y: 32, w: 32, h: 32 },
    [GameskinPart.PARTICLE_7]: { x: 288, y: 0, w: 64, h: 64 },
    [GameskinPart.PARTICLE_8]: { x: 352, y: 0, w: 64, h: 64 },
    [GameskinPart.PARTICLE_9]: { x: 416, y: 0, w: 64, h: 64 },
    [GameskinPart.STAR_1]: { x: 480, y: 0, w: 64, h: 64 },
    [GameskinPart.STAR_2]: { x: 544, y: 0, w: 64, h: 64 },
    [GameskinPart.STAR_3]: { x: 608, y: 0, w: 64, h: 64 },
    [GameskinPart.HEALTH_FULL]: { x: 672, y: 0, w: 64, h: 64 },
    [GameskinPart.HEALTH_EMPTY]: { x: 736, y: 0, w: 64, h: 64 },
    [GameskinPart.ARMOR_FULL]: { x: 672, y: 64, w: 64, h: 64 },
    [GameskinPart.ARMOR_EMPTY]: { x: 736, y: 64, w: 64, h: 64 },
    [GameskinPart.HEART]: { x: 320, y: 64, w: 64, h: 64 },
    [GameskinPart.SHIELD]: { x: 384, y: 64, w: 64, h: 64 },
    [GameskinPart.MINUS]: { x: 256, y: 64, w: 64, h: 64 },
    [GameskinPart.NINJA_TIMER]: { x: 672, y: 128, w: 128, h: 64 },
    [GameskinPart.NINJA_PARTICLE_1]: { x: 800, y: 0, w: 224, h: 128 },
    [GameskinPart.NINJA_PARTICLE_2]: { x: 800, y: 128, w: 224, h: 128 },
    [GameskinPart.NINJA_PARTICLE_3]: { x: 800, y: 256, w: 224, h: 128 },
    [GameskinPart.FLAG_BLUE]: { x: 384, y: 256, w: 128, h: 256 },
    [GameskinPart.FLAG_RED]: { x: 512, y: 256, w: 128, h: 256 },
  },
  [AssetKind.EMOTICON]: {
    [EmoticonPart.PART_1_1]: { x: 0, y: 0, w: 128, h: 128 },
    [EmoticonPart.PART_1_2]: { x: 128, y: 0, w: 128, h: 128 },
    [EmoticonPart.PART_1_3]: { x: 256, y: 0, w: 128, h: 128 },
    [EmoticonPart.PART_1_4]: { x: 384, y: 0, w: 128, h: 128 },
    [EmoticonPart.PART_2_1]: { x: 0, y: 128, w: 128, h: 128 },
    [EmoticonPart.PART_2_2]: { x: 128, y: 128, w: 128, h: 128 },
    [EmoticonPart.PART_2_3]: { x: 256, y: 128, w: 128, h: 128 },
    [EmoticonPart.PART_2_4]: { x: 384, y: 128, w: 128, h: 128 },
    [EmoticonPart.PART_3_1]: { x: 0, y: 256, w: 128, h: 128 },
    [EmoticonPart.PART_3_2]: { x: 128, y: 256, w: 128, h: 128 },
    [EmoticonPart.PART_3_3]: { x: 256, y: 256, w: 128, h: 128 },
    [EmoticonPart.PART_3_4]: { x: 384, y: 256, w: 128, h: 128 },
    [EmoticonPart.PART_4_1]: { x: 0, y: 384, w: 128, h: 128 },
    [EmoticonPart.PART_4_2]: { x: 128, y: 384, w: 128, h: 128 },
    [EmoticonPart.PART_4_3]: { x: 256, y: 384, w: 128, h: 128 },
    [EmoticonPart.PART_4_4]: { x: 384, y: 384, w: 128, h: 128 },
  },
  [AssetKind.PARTICULE]: {
    [ParticulePart.SMALL_1]: { x: 0, y: 0, w: 64, h: 64 },
    [ParticulePart.SMALL_2]: { x: 64, y: 0, w: 64, h: 64 },
    [ParticulePart.SMALL_3]: { x: 128, y: 0, w: 64, h: 64 },
    [ParticulePart.SMALL_4]: { x: 192, y: 0, w: 64, h: 64 },
    [ParticulePart.SMALL_5]: { x: 256, y: 0, w: 64, h: 64 },
    [ParticulePart.SMALL_6]: { x: 0, y: 64, w: 64, h: 64 },
    [ParticulePart.SMALL_7]: { x: 64, y: 64, w: 64, h: 64 },
    [ParticulePart.SMALL_8]: { x: 128, y: 64, w: 64, h: 64 },
    [ParticulePart.SMALL_9]: { x: 192, y: 64, w: 64, h: 64 },
    [ParticulePart.MID_1]: { x: 256, y: 64, w: 128, h: 128 },
    [ParticulePart.MID_2]: { x: 0, y: 128, w: 128, h: 128 },
    [ParticulePart.MID_3]: { x: 128, y: 128, w: 128, h: 128 },
    [ParticulePart.BIG]: { x: 0, y: 256, w: 256, h: 256 },
  },
  [AssetKind.UNKNOWN]: undefined,
}

/**
 * This function retrieves metadata for a specific asset part based on its kind.
 * @param {AssetKind} kind - Asset kind
 * @param {AssetPart} assetPart - Asset part
 * @returns an object of type `IAssetPartMetadata`.
 */
export function getAssetPartMetadata(
  kind: AssetKind,
  assetPart: AssetPart,
): IAssetPartMetadata {
  if (kind == AssetKind.UNKNOWN) {
    throw new AssetPartError("Unauthorized asset kind.");
  }

  if (assetPart === SkinPart.BLINK_EYE) {
    assetPart = SkinPart.DEFAULT_EYE;
  }

  if (Object.hasOwn(ASSET_PARTS[kind], assetPart) === false) {
    throw new AssetPartError(assetPart + ' is not a part of ' + kind + '.');
  }
  
  return ASSET_PARTS[kind][assetPart];
}

/**
 * This function returns metadata for asset parts based on the provided asset kind.
 * @param {AssetKind} kind - Asset kind
 * @returns Every parts metadata
 */
export function getAssetPartsMetadata(
  kind: AssetKind
): Record<string, IAssetPartMetadata> {
  return ASSET_PARTS[kind]
}

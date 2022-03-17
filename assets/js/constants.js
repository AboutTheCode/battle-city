export const MAP_SIZE = 26;
export const CELL_SIZE = 32;

export const MAP_OBJECT_EMPTY = 0;
export const MAP_OBJECT_BRICK = 1;
export const MAP_OBJECT_STEEL = 2;
export const MAP_OBJECT_JUNGLE = 3;
export const MAP_OBJECT_WATER = 4;
export const MAP_OBJECT_ICE = 5;
export const MAP_OBJECT_BASE = 6;
export const MAP_OBJECT_BASE_DESTROID = 7;

export const SIDEBAR_WIDTH = 128;
export const SIDEBAR_SPRITE = [1501, 0, 128, 960];

export const FILENAME_SPRITES = 'images/sprites2.png';

export
const MAP_OBJECT_SPRITES = {
  [MAP_OBJECT_EMPTY]: [0,0,0,0],
  [MAP_OBJECT_BRICK]: [1052, 0, 32, 32],
  [MAP_OBJECT_STEEL]: [1052, 64, 32, 32],
  [MAP_OBJECT_JUNGLE]: [1116, 128, 32, 32],
  [MAP_OBJECT_WATER]: [1052, 192, 32, 32],
  [MAP_OBJECT_ICE]: [1180, 128, 32, 32],
  [MAP_OBJECT_BASE]: [1244, 128, 64, 64],
};

export const DIRECTION_UP = 0;
export const DIRECTION_DOWN = 1;
export const DIRECTION_LEFT = 2;
export const DIRECTION_RIGHT = 3;

export const TANK_PLAYER = 0;
export const TANK_NORMAL = 1;
export const TANK_SWIFT = 2;
export const TANK_MEDIUM = 3;
export const TANK_HEAVY = 4;

export const TANKS_SPRITES = {
  [TANK_PLAYER]: {
    [DIRECTION_UP]: [[4, 8, 52, 52], [68, 8, 52, 52]],
    [DIRECTION_DOWN]: [[264, 4, 52, 52], [328, 4, 52, 52]],
    [DIRECTION_LEFT]: [[136, 4, 52, 52], [204, 4, 52, 52]],
    [DIRECTION_RIGHT]: [[392, 4, 52, 52], [460, 4, 52, 52]],
  },
  [TANK_NORMAL]: {
    [DIRECTION_UP]: [[524, 264, 52, 60], [588, 264, 52, 60]],
    [DIRECTION_DOWN]: [[780, 264, 52, 60], [844, 264, 52, 60]],
    [DIRECTION_LEFT]: [[648, 272, 60, 52], [712, 272, 60, 52]],
    [DIRECTION_RIGHT]: [[908, 268, 60, 52], [972, 268, 60, 52]],
  },
  [TANK_SWIFT]: {
    [DIRECTION_UP]: [[524, 328, 52, 60], [588, 328, 52, 60]],
    [DIRECTION_DOWN]: [[780, 332, 52, 60], [844, 332, 52, 60]],
    [DIRECTION_LEFT]: [[648, 336, 60, 52], [712, 336, 60, 52]],
    [DIRECTION_RIGHT]: [[908, 332, 60, 52], [972, 332, 60, 52]],
  },
  [TANK_MEDIUM]: {
    [DIRECTION_UP]: [[524, 396, 52, 60], [588, 396, 52, 60]],
    [DIRECTION_DOWN]: [[780, 396, 52, 60], [844, 396, 52, 60]],
    [DIRECTION_LEFT]: [[648, 404, 60, 52], [712, 404, 60, 52]],
    [DIRECTION_RIGHT]: [[908, 400, 60, 52], [972, 400, 60, 52]],
  },
  [TANK_HEAVY]: {
    [DIRECTION_UP]: [[524, 460, 52, 60], [588, 460, 52, 60]],
    [DIRECTION_DOWN]: [[780, 460, 52, 60], [844, 460, 52, 60]],
    [DIRECTION_LEFT]: [[648, 464, 60, 52], [712, 464, 60, 52]],
    [DIRECTION_RIGHT]: [[904, 464, 60, 52], [968, 464, 60, 52]],
  }
};

export const BULLET_SPRITE = {
  [DIRECTION_UP]: [1320, 408, 12, 16],
  [DIRECTION_DOWN]: [1384, 408, 12, 16],
  [DIRECTION_LEFT]: [1348, 408, 16, 12],
  [DIRECTION_RIGHT]: [1412, 408, 16, 12]
};

export const IMMORTAL_SPRITE = [[1052, 574, 64, 64], [1116, 574, 64, 64]];
export const BORN_SPRITE = [[1052, 382, 64, 64], [1116, 382, 64, 64], [1180, 382, 64, 64], [1244, 382, 64, 64]];
export const EXPLOSION_SPRITE = [[1052, 512, 64, 64], [1116, 512, 64, 64], [1180, 512, 64, 64], [1244, 512, 128, 128], [1372, 512, 128, 128]];

export const BORN_TIME = 500;
export const EXPLOSION_TIME = 500;
export const IMMORTAL_TIME = 4000;

export const SHOOT_COOLDOWN_DEFAULT = 200;
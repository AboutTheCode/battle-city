import BaseObject from './BaseObject.js';
import {
  BULLET_SPRITE,
  CELL_SIZE,
  DIRECTION_DOWN,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
  EXPLOSION_SPRITE,
  EXPLOSION_TIME,
  FILENAME_SPRITES,
  MAP_OBJECT_BRICK,
  MAP_OBJECT_EMPTY,
  MAP_OBJECT_ICE,
  MAP_OBJECT_JUNGLE,
  MAP_OBJECT_STEEL,
  MAP_OBJECT_WATER,
  MAP_SIZE
} from '../constants.js';

const SPEED_DIV = 4;

export default
class Bullet extends BaseObject {
  x = 0;

  y = 0;

  tickSlide = 0;

  constructor({
                x,
                y,
                direction,
                ResourceManager,
                Sounds,
                tank,
                map,
                damage
              }) {
    super();

    this.x = x;
    this.y = y;
    this.direction = direction;
    this.damage = damage;
    this.resourceManager = ResourceManager;
    this.sounds = Sounds;
    this.tank = tank;
    this.map = map;
    this.speed = CELL_SIZE / SPEED_DIV;
    this.isExplosion = false;
    this.isActive = true;
  }

  draw(context) {
    const [spriteX, spriteY, spriteWidth, spriteHeight] = BULLET_SPRITE[this.direction];
    context.drawSprite(
      this.resourceManager.get(FILENAME_SPRITES),
      spriteX, spriteY, spriteWidth, spriteHeight,
      this.x - (spriteWidth / 2), this.y - (spriteHeight / 2), // centered
      spriteWidth, spriteHeight
    );

    if (this.isExplosion) {
      const [spriteX, spriteY, spriteWidth, spriteHeight] = EXPLOSION_SPRITE[Math.round(this.tickSlide / 10) % 3];
      context.drawSprite(
        this.resourceManager.get(FILENAME_SPRITES),
        spriteX, spriteY, spriteWidth, spriteHeight,
        this.x - (spriteWidth / 2), this.y - (spriteHeight / 2), // centered
        spriteWidth, spriteHeight
      );
    }
  }

  tick() {
    this.tickSlide = this.tickSlide + 1;
    if (this.tickSlide === 100) {
      this.tickSlide = 0;
    }
    if (this.isExplosion) {
      return;
    }

    let deltaX = 0;
    let deltaY = 0;
    switch (this.direction) {
      case DIRECTION_UP:
        deltaY = -this.speed;
        break;
      case DIRECTION_DOWN:
        deltaY = this.speed;
        break;
      case DIRECTION_LEFT:
        deltaX = -this.speed;
        break;
      case DIRECTION_RIGHT:
        deltaX = this.speed;
        break;
      default:
        break;
    }

    const res = this.map.checkCollision(this, this.x, this.y, [MAP_OBJECT_JUNGLE, MAP_OBJECT_ICE, MAP_OBJECT_WATER])
             || this.map.checkCollision(this, this.x - 1, this.y - 1, [MAP_OBJECT_JUNGLE, MAP_OBJECT_ICE, MAP_OBJECT_WATER]);
    if (res) {
      if (res === 'out-of-bounds') {
        this.isActive = false;
        this.map.removeObject(this);
      } else {
        const res = this.map.getByRowCell(this.x, this.y);
        if (res) {
          this.x += deltaX;
          this.y += deltaY;
          const { row, cell } = res;
          const row2 = (this.direction === DIRECTION_UP || this.direction === DIRECTION_DOWN) ? row : row - 1;
          const cell2 = (this.direction === DIRECTION_UP || this.direction === DIRECTION_DOWN) ? cell - 1 : cell;

          const block = map.get(cell, row);
          const block2 = map.get(cell2, row2);

          if (block === MAP_OBJECT_BRICK) {
            this.map.set(cell, row, MAP_OBJECT_EMPTY);
          }
          if (block2 === MAP_OBJECT_BRICK) {
            this.map.set(cell2, row2, MAP_OBJECT_EMPTY);
          }

          this.map.redrawMap();
          this.explode();
        } else {
          this.isActive = false;
          this.map.removeObject(this);
        }
      }
      return;
    }
    this.x += deltaX;
    this.y += deltaY;

    function removeBlock(map, row, cell, damage) {
      const block = map.get(cell, row);
      if (block === MAP_OBJECT_BRICK) {
        map.set(cell, row, MAP_OBJECT_EMPTY);
      }
    }
  }

  async explode() {
    if (this.tank.isPlayer) {
      this.sounds.play('hit', ['shoot', 'move', 'idle']);
    }
    return new Promise((resolve) => {
      this.isExplosion = true;
      setTimeout(() => {
        this.isActive = false;
        this.map.removeObject(this);
        resolve();
      }, EXPLOSION_TIME / 2);
    });
  }

  get mapBounds() {
    return [this.x, this.y, 0, 0];
  }
}

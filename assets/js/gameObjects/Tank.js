import {
  FILENAME_SPRITES,
  TANKS_SPRITES,
  DIRECTION_UP,
  DIRECTION_DOWN,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  IMMORTAL_SPRITE,
  BORN_SPRITE,
  BORN_TIME,
  IMMORTAL_TIME,
  EXPLOSION_TIME,
  EXPLOSION_SPRITE,
  CELL_SIZE,
  SHOOT_COOLDOWN_DEFAULT, TANK_PLAYER, TANK_SWIFT
} from '../constants.js';
import Bullet from './Bullet.js';
import BaseObject from './BaseObject.js';

export default
class Tank extends BaseObject {
  x = 0;

  y = 0;

  tickSlide = 0;

  constructor({
    x,
    y,
    type,
    direction,
    ResourceManager,
    Sounds,
    map
  }) {
    super();

    this.x = x;
    this.y = y;
    this.type = type;
    this.direction = direction;
    this.moving = false;
    this.resourceManager = ResourceManager;
    this.sounds = Sounds;
    this.map = map;

    this.speed = 4;
    if (type === TANK_SWIFT) {
      this.speed = 8
    }

    this.shootCooldown = 0;
    this.bullets = [];
    this.isBorn = false;
    this.isImmortal = false;
    this.isExplosion = false;
  }

  get isPlayer() {
    return this.type === TANK_PLAYER;
  }

  draw(context) {
    const tick = Math.round(this.tickSlide / 2); // slow animation
    if (this.isBorn) {
      this.drawTankSprite(context, BORN_SPRITE[tick % 4]);
      return;
    }

    this.drawTankSprite(context, this.bounds);
    // debug frame
    // const [debugX, debugY, tankWidth, tankHeight] = this.mapBounds;
    // context.drawRect(this.x - 1, this.y - 1, 2, 2, 'lightgreen');
    // context.lines([
    //   { x1: debugX, y1: debugY, x2: debugX, y2: debugY + tankHeight },
    //   { x1: debugX, y1: debugY + tankHeight, x2: debugX + tankWidth, y2: debugY + tankHeight },
    //   { x1: debugX + tankWidth, y1: debugY, x2: debugX + tankWidth, y2: debugY + tankHeight },
    //   { x1: debugX, y1: debugY, x2: debugX + tankWidth, y2: debugY }
    // ], 'green');

    if (this.isExplosion) {
      this.drawTankSprite(context, EXPLOSION_SPRITE[Math.round(this.tickSlide / 10) % 5]);
      return;
    }

    if (this.isImmortal) {
      this.drawTankSprite(context, IMMORTAL_SPRITE[tick % 2]);
    }

    if (this.isPlayer) {
      if (this.moving) {
        this.sounds.play('move', ['idle']);
      } else {
        this.sounds.play('idle', ['move']);
      }
    }
  }

  drawTankSprite(context, sprite) {
    const [spriteX, spriteY, spriteWidth, spriteHeight] = sprite;
    context.drawSprite(
      this.resourceManager.get(FILENAME_SPRITES),
      spriteX, spriteY, spriteWidth, spriteHeight,
      this.x - (spriteWidth / 2), this.y - (spriteHeight / 2), // centered
      spriteWidth, spriteHeight
    );
  }

  tick() {
    if (this.shootCooldown > 0) {
      this.shootCooldown -= 20;
      if (this.shootCooldown <= 0) {
        this.shootCooldown = 0;
      }
    }
    this.tickSlide = this.tickSlide + 1;
    if (this.tickSlide === 100) {
      this.tickSlide = 0;
    }
  }

  move(direction) {
    if (this.isBorn || this.isExplosion) {
      return;
    }
    this.direction = direction;
    this.moving = true;

    let newX = this.x;
    let newY = this.y;
    switch (this.direction) {
      case DIRECTION_UP:
        newX = Math.round(newX / CELL_SIZE) * CELL_SIZE;
        newY -= this.speed;
        break;
      case DIRECTION_DOWN:
        newX = Math.round(newX / CELL_SIZE) * CELL_SIZE;
        newY += this.speed;
        break;
      case DIRECTION_LEFT:
        newX -= this.speed;
        newY = Math.round(newY / CELL_SIZE) * CELL_SIZE;
        break;
      case DIRECTION_RIGHT:
        newX += this.speed;
        newY = Math.round(newY / CELL_SIZE) * CELL_SIZE;
        break;
      default:
        break;
    }
    const [,,tankWidth, tankHeight] = this.mapBounds;
    if (
      !this.map.checkCollision(this, newX - tankWidth / 2, newY - tankHeight / 2) &&
      !this.map.checkCollision(this, newX - tankWidth / 2, newY + tankHeight / 2) &&
      !this.map.checkCollision(this, newX + tankWidth / 2, newY - tankHeight / 2) &&
      !this.map.checkCollision(this, newX + tankWidth / 2, newY + tankHeight / 2)
    ) {
      this.x = newX;
      this.y = newY;
    }
  }

  get mapBounds() {
    const [,,tankWidth, tankHeight] = this.bounds;
    const x = this.x - ((tankWidth / 2));
    const y = this.y - ((tankHeight / 2));

    return [x, y, tankWidth, tankHeight];
  }

  get bounds() {
    const tick = Math.round(this.tickSlide / 2); // slow animation
    return TANKS_SPRITES[this.type][this.direction][this.moving ? tick % 2 : 0];
  }

  stop() {
    this.moving = false;
  }

  shoot() {
    if (this.isBorn || this.isExplosion) {
      return;
    }
    if (this.shootCooldown > 0) {
      return;
    }

    const [tankX, tankY, tankWidth, tankHeight] = this.mapBounds;
    let x = tankX + CELL_SIZE;
    let y = tankY + CELL_SIZE;
    if (this.direction === DIRECTION_DOWN) {
      y += tankHeight;
    }
    if (this.direction === DIRECTION_RIGHT) {
      x += tankWidth;
    }
    if (this.direction === DIRECTION_UP || this.direction === DIRECTION_DOWN) {
      y -= CELL_SIZE;
    }
    if (this.direction === DIRECTION_LEFT || this.direction === DIRECTION_RIGHT) {
      x -= CELL_SIZE;
    }
    this.bullets = this.bullets.filter((bullet) => bullet.isActive);
    if (!this.bullets.length) {
      const bullet = new Bullet({
        x: Math.round(x / CELL_SIZE) * CELL_SIZE,
        y: Math.round(y / CELL_SIZE) * CELL_SIZE,
        direction: this.direction,
        ResourceManager: this.resourceManager,
        Sounds: this.sounds,
        map: this.map,
        damage: 1,
        tank: this
      });
      this.bullets.push(bullet);
      this.map.gameObjects.push(bullet);
      if (this.isPlayer) {
        this.sounds.play('shoot');
      }
    }
    this.shootCooldown = SHOOT_COOLDOWN_DEFAULT;
  }

  born(isImmortal = true) {
    this.isBorn = true;
    setTimeout(() => this.isBorn = false, BORN_TIME);

    if (isImmortal) {
      this.isImmortal = isImmortal;
      setTimeout(() => this.isImmortal = false, IMMORTAL_TIME);
    }
  }

  async explode() {
    if (this.isPlayer) {
      this.sounds.play('explosion', ['shoot', 'move', 'idle']);
    }
    return new Promise((resolve) => {
      this.isExplosion = true;
      setTimeout(() => {
        this.isExplosion = false;
        this.isBorn = true;
        resolve();
      }, EXPLOSION_TIME);
    });
  }
}

import {
  MAP_SIZE,
  MAP_OBJECT_EMPTY,
  MAP_OBJECT_BRICK,
  CELL_SIZE,
  MAP_OBJECT_SPRITES,
  FILENAME_SPRITES,
  MAP_OBJECT_BASE,
  MAP_OBJECT_STEEL,
  MAP_OBJECT_JUNGLE,
  COLLISION_GROUP_ENV,
  MAP_OBJECT_WATER,
  BONUSES_SPRITES,
  BONUSES,
  MAX_BONUSES_ON_MAP,
  COLLISION_GROUP_BONUS,
  BONUS_IMMORTAL,
  BONUS_FREEZE,
  BONUS_BASE_STEEL, BONUS_RANK, BONUS_BAYRAKTAR, BONUS_LIFE
} from '../constants.js';
import DrawingContext from '../DrawingContext.js';
import PhysicsWorld from '../physics/PhysicsWorld.js';
import PhysicsEntity from '../physics/PhysicsEntity.js';

const MAP_BG_COLOR = '#000';

export default
class GameMap {
  map = [];

  currentMapImage = null;

  gameObjects = [];

  bonuses = [];

  blinkSlide = 0;

  constructor({ ResourceManager, Sounds }) {
    this.sounds = Sounds;
    this.resourceManager = ResourceManager;
    const size = MAP_SIZE * CELL_SIZE;
    this.canvas = new OffscreenCanvas(size, size);
    this.context = new DrawingContext({ canvas: this.canvas });
    this.highlightX = null;
    this.highlightY = null;
    this.highlightTool = null;
    this.isConstructor = false;
    this.isDebug = false;
    this.world = new PhysicsWorld({ width: size, height: size });
    setInterval(() => this.blinkSlide = this.blinkSlide === 1 ? 0 : 1, 250);
  }

  setMap(map) {
    this.world.clear();
    this.map = map;

    for (let x = 0; x < MAP_SIZE; x++) {
      for (let y = 0; y < MAP_SIZE; y++) {
        const block = this.get(x, y);
        if (block !== MAP_OBJECT_STEEL && block !== MAP_OBJECT_BRICK && block !== MAP_OBJECT_WATER) {
          continue;
        }
        this.world.addObject(
          new PhysicsEntity({
            x: x * CELL_SIZE + 1, y: y * CELL_SIZE + 1, width: CELL_SIZE - 2, height: CELL_SIZE - 2,
            ref: { row: y, cell: x, block }, groups: [COLLISION_GROUP_ENV, `${COLLISION_GROUP_ENV}${block}`]
          })
        );
      }
    }
  }

  get(x, y) {
    return this.map[MAP_SIZE * y + x];
  }

  set(x, y, obj) {
    if (this.map[MAP_SIZE * y + x] === MAP_OBJECT_BASE) {
      return;
    }
    this.map[MAP_SIZE * y + x] = obj;
  }

  clear(x, y, obj) {
    if (this.map[MAP_SIZE * y + x] === MAP_OBJECT_EMPTY) {
      return;
    }
    this.map[MAP_SIZE * y + x] = MAP_OBJECT_EMPTY;
    for (const obj of this.world.objects) {
      if (obj.ref && obj.ref.row === y && obj.ref.cell === x) {
        this.world.removeObject(obj);
      }
    }
  }

  putBase(material = MAP_OBJECT_BRICK) {
    this.set(MAP_SIZE / 2 - 2, MAP_SIZE - 3, material);
    this.set(MAP_SIZE / 2 - 1, MAP_SIZE - 3, material);
    this.set(MAP_SIZE / 2, MAP_SIZE - 3, material);
    this.set(MAP_SIZE / 2 + 1, MAP_SIZE - 3, material);
    this.set(MAP_SIZE / 2 - 2, MAP_SIZE - 2, material);
    this.set(MAP_SIZE / 2 - 2, MAP_SIZE - 1, material);
    this.set(MAP_SIZE / 2 + 1, MAP_SIZE - 2, material);
    this.set(MAP_SIZE / 2 + 1, MAP_SIZE - 1, material);

    this.set(MAP_SIZE / 2, MAP_SIZE - 2, MAP_OBJECT_BASE);
    this.set(MAP_SIZE / 2, MAP_SIZE - 1, MAP_OBJECT_BASE);
    this.set(MAP_SIZE / 2 - 1, MAP_SIZE - 2, MAP_OBJECT_BASE);
    this.set(MAP_SIZE / 2 - 1, MAP_SIZE - 1, MAP_OBJECT_BASE);
    this.currentMapImage = null;
  }

  getX(cell) {
    return cell * CELL_SIZE;
  }

  getY(row) {
    return row * CELL_SIZE;
  }

  putEnemiesPlaces() {
    // left
    this.set(0, 0, MAP_OBJECT_EMPTY);
    this.set(0, 1, MAP_OBJECT_EMPTY);
    this.set(1, 0, MAP_OBJECT_EMPTY);
    this.set(1, 1, MAP_OBJECT_EMPTY);

    // center
    this.set(MAP_SIZE / 2, 0, MAP_OBJECT_EMPTY);
    this.set(MAP_SIZE / 2, 1, MAP_OBJECT_EMPTY);
    this.set(MAP_SIZE / 2 - 1, 0, MAP_OBJECT_EMPTY);
    this.set(MAP_SIZE / 2 - 1, 1, MAP_OBJECT_EMPTY);

    // right
    this.set(MAP_SIZE - 1, 0, MAP_OBJECT_EMPTY);
    this.set(MAP_SIZE - 1, 1, MAP_OBJECT_EMPTY);
    this.set(MAP_SIZE - 2, 0, MAP_OBJECT_EMPTY);
    this.set(MAP_SIZE - 2, 1, MAP_OBJECT_EMPTY);
  }

  putPlayer1(tank) {
    tank.x = this.getX(MAP_SIZE / 2 - 4);
    tank.y = this.getY(MAP_SIZE - 2);

    this.set(MAP_SIZE / 2 - 4, MAP_SIZE - 1, MAP_OBJECT_EMPTY);
    this.set(MAP_SIZE / 2 - 4, MAP_SIZE - 2, MAP_OBJECT_EMPTY);
    this.set(MAP_SIZE / 2 - 4 - 1, MAP_SIZE - 1, MAP_OBJECT_EMPTY);
    this.set(MAP_SIZE / 2 - 4 - 1, MAP_SIZE - 2, MAP_OBJECT_EMPTY);

    this.addObject(tank);
    this.world.addObject(tank.physicEntity);
  }

  redrawMap() {
    // console.info('redrawMap');
    this.context.clear(MAP_BG_COLOR);
    if (this.isDebug) {
      this.drawLines();
      this.world.drawDebug(this.context);
    } else {
      for (let x = 0; x < MAP_SIZE; x++) {
        for (let y = 0; y < MAP_SIZE; y++) {
          const block = this.get(x, y);
          if (block === MAP_OBJECT_BASE) {
            continue;
          }
          const [spriteX, spriteY, spriteWidth, spriteHeight] = MAP_OBJECT_SPRITES[block];
          this.context.drawSprite(this.resourceManager.get(FILENAME_SPRITES), spriteX + 1, spriteY, spriteWidth, spriteHeight, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }

      // draw base
      const [spriteX, spriteY, spriteWidth, spriteHeight] = MAP_OBJECT_SPRITES[MAP_OBJECT_BASE];
      this.context.drawSprite(this.resourceManager.get(FILENAME_SPRITES), spriteX, spriteY, spriteWidth, spriteHeight, MAP_SIZE * CELL_SIZE / 2 - CELL_SIZE, (MAP_SIZE - 2) * CELL_SIZE, CELL_SIZE * 2, CELL_SIZE * 2);
    }
    this.currentMapImage = this.canvas.transferToImageBitmap();
  }

  drawJungle() {
    for (let x = 0; x < MAP_SIZE; x++) {
      for (let y = 0; y < MAP_SIZE; y++) {
        const block = this.get(x, y);
        if (block !== MAP_OBJECT_JUNGLE) {
          continue;
        }
        const [spriteX, spriteY, spriteWidth, spriteHeight] = MAP_OBJECT_SPRITES[block];
        this.context.drawSprite(this.resourceManager.get(FILENAME_SPRITES), spriteX + 1, spriteY, spriteWidth, spriteHeight, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  draw() {
    const size = MAP_SIZE * CELL_SIZE;
    // important set size after getContext
    this.canvas.width = size;
    this.canvas.height = size;

    if (!this.currentMapImage || this.isDebug) {
      this.redrawMap();
    }
    this.context.drawImage(this.currentMapImage, 0, 0, size, size);

    if (this.isConstructor) {
      if (this.highlightX) {
        let cellSize = CELL_SIZE * 2;
        if (this.highlightTool === MAP_OBJECT_BRICK || this.highlightTool === MAP_OBJECT_STEEL) {
          cellSize = CELL_SIZE;
        }
        const row = Math.floor(this.highlightY / cellSize);
        const cell = Math.floor(this.highlightX / cellSize);
        const hX = cell * cellSize;
        const hY = row * cellSize;
        const block = this.getByCoordinate(hX, hY);
        if (block !== null && this.highlightTool !== null && block !== MAP_OBJECT_BASE) {
          this.context.ctx.globalAlpha = .5;
          const [spriteX, spriteY, spriteWidth, spriteHeight] = MAP_OBJECT_SPRITES[this.highlightTool];
          if (this.highlightTool === MAP_OBJECT_EMPTY) {
            this.context.drawRect(hX, hY, cellSize, cellSize, '#666');
          } else {
            this.context.drawSprite(this.resourceManager.get(FILENAME_SPRITES), spriteX, spriteY, cellSize, cellSize, hX, hY, cellSize, cellSize);
          }
          this.context.ctx.globalAlpha = 1;
        }
      }

      this.drawLines()
    } else {
      for (const object of this.gameObjects) {
        object.draw(this.context);
      }
    }

    if (!this.isDebug) {
      this.drawJungle();
    }
    for (const index in this.bonuses) {
      if ((this.blinkSlide + Number(index)) % 2 === 0) { // щоб по черзі блимали
        const { type, row, cell } = this.bonuses[index];
        const [x, y, w, h] = BONUSES_SPRITES[type];
        this.context.drawSprite(this.resourceManager.get(FILENAME_SPRITES), x, y, w, h, cell * CELL_SIZE, row * CELL_SIZE, w, h);
      }
    }
    return this.canvas.transferToImageBitmap();
  }

  drawLines() {
    const lines = [];
    for (let n = 0; n < MAP_SIZE; n++) {
      lines.push({ x1: 0, y1: n * CELL_SIZE, x2: MAP_SIZE * CELL_SIZE, y2: n * CELL_SIZE });
      lines.push({ x1: n * CELL_SIZE, y1: 0, x2: n * CELL_SIZE, y2: MAP_SIZE * CELL_SIZE });
    }
    this.context.lines(lines);
  }

  drawDebugCell(row, cell) {
    const lines = [];
    const x = cell * CELL_SIZE;
    const y = row * CELL_SIZE;
    lines.push({ x1: x, y1: y, x2: x + CELL_SIZE, y2: y });
    lines.push({ x1: x, y1: y, x2: x, y2: y + CELL_SIZE });
    lines.push({ x1: x, y1: y + CELL_SIZE, x2: x + CELL_SIZE, y2: y + CELL_SIZE });
    this.context.lines(lines);
  }

  getByRowCell(x, y) {
    const row = Math.floor(y / CELL_SIZE);
    const cell = Math.floor(x / CELL_SIZE);
    if (row > MAP_SIZE - 1 || cell > MAP_SIZE - 1 || row < 0 || cell < 0) {
      return null;
    }

    return { row, cell }
  }

  getByCoordinate(x, y) {
    const res = this.getByRowCell(x, y);
    if (!res) {
      return null;
    }
    const { row, cell } = res;

    return this.get(cell, row);
  }

  highlight(x, y, tool) {
    this.highlightX = x;
    this.highlightY = y;
    this.highlightTool = tool;
  }

  save() {
    return JSON.stringify(this.map);
  }

  addObject(obj) {
    this.gameObjects.push(obj);
  }

  removeObject(item) {
    this.world.removeObject(item.physicEntity);
    this.gameObjects = this.gameObjects.filter((obj) => obj !== item);
  }

  createBonus() {
    const bonusIndex = Math.round(Math.random() * (BONUSES.length - 1));
    const row = Math.round(Math.random() * (MAP_SIZE - 4)) + 2;
    const cell = Math.round(Math.random() * (MAP_SIZE - 4)) + 2;

    if (this.bonuses.length === MAX_BONUSES_ON_MAP) {
      const removeObj = this.bonuses.shift();
      this.world.removeObject(removeObj.physic);
    }
    const bonus = {
      isPowerUp: true,
      row,
      cell,
      type: BONUSES[bonusIndex]
    };
    bonus.physic = new PhysicsEntity({
      x: cell * CELL_SIZE,
      y: row * CELL_SIZE,
      width: CELL_SIZE * 2,
      height: CELL_SIZE * 2,
      ref: bonus,
      groups: [COLLISION_GROUP_BONUS]
    });
    this.bonuses.push(bonus);
    this.world.addObject(bonus.physic);
  }

  catchBonus(bonus, tank) {
    this.bonuses = this.bonuses.filter((b) => b !== bonus);
    this.world.removeObject(bonus.physic);

    console.info(bonus);
    console.trace();
    switch (bonus.type) {
      case BONUS_IMMORTAL:
        tank.isImmortal = true;
        setTimeout(() => tank.isImmortal = false, 5000);
        break;
      case BONUS_FREEZE:
        this.gameObjects.forEach((obj) => !obj.isPlayer && (obj.isFreeze = true));
        setTimeout(() => this.gameObjects.forEach((obj) => !obj.isPlayer && (obj.isFreeze = false)), 5000);
        break;
      case BONUS_BASE_STEEL:
        this.putBase(MAP_OBJECT_STEEL);
        setTimeout(() => this.putBase(MAP_OBJECT_BRICK), 10000);
        break;
      case BONUS_RANK:
        this.sounds.play('levelUp');
        if (tank.gameState.tankRank < 3) {
          tank.gameState.tankRank++;
        }
        break;
      case BONUS_BAYRAKTAR:
        this.sounds.play('bomb');
        this.gameObjects.forEach((obj) => !obj.isPlayer && obj.explode());
        break;
      case BONUS_LIFE:
        this.sounds.play('collect');
        tank.gameState.lives++;
        break;
    }
  }
}

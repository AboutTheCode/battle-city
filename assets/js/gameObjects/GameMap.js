import {
  MAP_SIZE,
  MAP_OBJECT_EMPTY,
  MAP_OBJECT_BRICK,
  CELL_SIZE,
  MAP_OBJECT_SPRITES,
  FILENAME_SPRITES, MAP_OBJECT_BASE, MAP_OBJECT_STEEL, MAP_OBJECT_JUNGLE, MAP_OBJECT_ICE
} from '../constants.js';
import DrawingContext from '../DrawingContext.js';

const MAP_BG_COLOR = '#000';

export default
class GameMap {
  map = [];

  currentMapImage = null;

  gameObjects = [];

  constructor({ ResourceManager }) {
    this.resourceManager = ResourceManager;
    const size = MAP_SIZE * CELL_SIZE;
    this.canvas = new OffscreenCanvas(size, size);
    this.context = new DrawingContext({ canvas: this.canvas });
    this.highlightX = null;
    this.highlightY = null;
    this.highlightTool = null;
    this.isConstructor = false;
    this.isDebug = false;
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

  putBase() {
    this.set(MAP_SIZE / 2 - 2, MAP_SIZE - 3, MAP_OBJECT_BRICK);
    this.set(MAP_SIZE / 2 - 1, MAP_SIZE - 3, MAP_OBJECT_BRICK);
    this.set(MAP_SIZE / 2, MAP_SIZE - 3, MAP_OBJECT_BRICK);
    this.set(MAP_SIZE / 2 + 1, MAP_SIZE - 3, MAP_OBJECT_BRICK);
    this.set(MAP_SIZE / 2 - 2, MAP_SIZE - 2, MAP_OBJECT_BRICK);
    this.set(MAP_SIZE / 2 - 2, MAP_SIZE - 1, MAP_OBJECT_BRICK);
    this.set(MAP_SIZE / 2 + 1, MAP_SIZE - 2, MAP_OBJECT_BRICK);
    this.set(MAP_SIZE / 2 + 1, MAP_SIZE - 1, MAP_OBJECT_BRICK);

    this.set(MAP_SIZE / 2, MAP_SIZE - 2, MAP_OBJECT_BASE);
    this.set(MAP_SIZE / 2, MAP_SIZE - 1, MAP_OBJECT_BASE);
    this.set(MAP_SIZE / 2 - 1, MAP_SIZE - 2, MAP_OBJECT_BASE);
    this.set(MAP_SIZE / 2 - 1, MAP_SIZE - 1, MAP_OBJECT_BASE);
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
    tank.y = this.getY(MAP_SIZE - 1);

    this.set(MAP_SIZE / 2 - 4, MAP_SIZE - 1, MAP_OBJECT_EMPTY);
    this.set(MAP_SIZE / 2 - 4, MAP_SIZE - 2, MAP_OBJECT_EMPTY);
    this.set(MAP_SIZE / 2 - 4 - 1, MAP_SIZE - 1, MAP_OBJECT_EMPTY);
    this.set(MAP_SIZE / 2 - 4 - 1, MAP_SIZE - 2, MAP_OBJECT_EMPTY);

    this.gameObjects.push(tank);
  }

  redrawMap() {
    // console.info('redrawMap');
    this.context.clear(MAP_BG_COLOR);
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

    if (!this.currentMapImage) {
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
          this.context.drawSprite(this.resourceManager.get(FILENAME_SPRITES), spriteX, spriteY, cellSize, cellSize, hX, hY, cellSize, cellSize);
          this.context.ctx.globalAlpha = 1;
        }
      }

      this.drawLines()
    } else {
      for (const object of this.gameObjects) {
        object.draw(this.context);

        if (object.constructor.name === 'Bullet') {
          if (object.tank.isPlayer) {
            const res = this.getByRowCell(object.x, object.y);
            if (res) {
              this.drawDebugCell(res.row, res.cell);
            }
            const res2 = this.getByRowCell(object.x - 1, object.y - 1);
            if (res2) {
              this.drawDebugCell(res2.row, res2.cell);
            }
          }
        }
      }
      if (this.isDebug) {
        this.drawLines();
      }
    }
    this.drawJungle();
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

  checkCollision(object, x, y, ignoreBlocks = [MAP_OBJECT_JUNGLE, MAP_OBJECT_ICE]) {
    if (x < 0 || y < 0 || x > MAP_SIZE * CELL_SIZE || y > MAP_SIZE * CELL_SIZE) {
      return 'out-of-bounds'; // out of bounds
    }
    // for (const obj of this.gameObjects) {
    //   if (obj.constructor.name === 'Tank' && obj === object) {
    //     continue;
    //   }
    //   const [objX, objY, objWidth, objHeight] = obj.mapBounds;
    //   if (x > objX || y > objY || x < objX + objWidth || y < objY + objHeight) {
    //     console.info(objX, objY, objWidth, objHeight);
    //     return 'tank';
    //   }
    // }
    const block = this.getByCoordinate(x, y);
    if (block === MAP_OBJECT_EMPTY || ignoreBlocks.includes(block)) {
      return false;
    }
    return true;
  }

  save() {
    return JSON.stringify(this.map);
  }

  addObject(obj) {
    this.gameObjects.push(obj);
  }

  removeObject(item) {
    this.gameObjects = this.gameObjects.filter((obj) => obj !== item);
  }
}

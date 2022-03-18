import {
  FILENAME_SPRITES,
  SIDEBAR_SPRITE,
  BG_COLOR
} from '../constants.js';
import DrawingContext from '../DrawingContext.js';

export default
class GameSidebar {
  constructor({ ResourceManager, GameState }) {
    this.resourceManager = ResourceManager;

    const [,, spriteWidth, spriteHeight] = SIDEBAR_SPRITE;
    this.canvas = new OffscreenCanvas(spriteWidth, spriteHeight);
    this.context = new DrawingContext({ canvas: this.canvas });
    this.gameState = GameState;
  }

  draw() {
    const [spriteX, spriteY, spriteWidth, spriteHeight] = SIDEBAR_SPRITE;

    // important set size after getContext
    this.canvas.width = spriteWidth;
    this.canvas.height = spriteHeight;
    this.context.drawSprite(
      this.resourceManager.get(FILENAME_SPRITES),
      spriteX, spriteY, spriteWidth, spriteHeight,
      0, 0, spriteWidth, spriteHeight
    );

    this.context.drawRect(1,3,100, 100, BG_COLOR);
    this.context.drawText(`${this.gameState.tanks.length}`, 100, 30);
    this.context.drawText(`${this.gameState.lives}`, 100, 50);
    this.context.drawText(`${this.gameState.killsScore}`, 100, 80);

    // this.currentMapImage = canvas.transferToImageBitmap();
    return this.canvas.transferToImageBitmap();
  }
}

import {
  FILENAME_SPRITES,
  SIDEBAR_SPRITE
} from '../constants.js';
import DrawingContext from '../DrawingContext.js';

export default
class GameSidebar {
  currentMapImage = null;

  constructor({ ResourceManager }) {
    this.resourceManager = ResourceManager;

    const [spriteX, spriteY, spriteWidth, spriteHeight] = SIDEBAR_SPRITE;
    this.canvas = new OffscreenCanvas(spriteWidth, spriteHeight);
    this.context = new DrawingContext({ canvas: this.canvas });
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

    // this.currentMapImage = canvas.transferToImageBitmap();
    return this.canvas.transferToImageBitmap();
  }
}

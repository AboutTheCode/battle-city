import Scene from '../Scene.js';
import ConstructorScene from './ConstructorScene.js';
import GameScene from './GameScene.js';
import Button from '../ui/Button.js';

const LOGO_SPRITES = 'images/logo.png';

export default
class MenuScene extends Scene {
  elements = [];

  constructor({ di, SceneManager, ResourceManager, DrawingContext, canvas, GameState }) {
    super();

    this.gameScene = di.get(GameScene);
    this.constructorScene = di.get(ConstructorScene);
    this.resourceManager = ResourceManager;
    this.drawingContext = DrawingContext;
    this.sceneManager = SceneManager;
    this.canvas = canvas;
    this.gameState = GameState;
  }

  move({ x, y }) {
    for (const element of this.elements) {
      if (x >= element.x && y >= element.y && x <= element.x + element.width && y <= element.y + element.height) {
        element.state = 1;
      } else {
        element.state = 0;
      }
    }
  }

  async loading() {
    await this.resourceManager.loadCss('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
    await this.resourceManager.loadResources([
      LOGO_SPRITES
    ]);

    this.elements = [
      new Button({
        x: 0,
        y: 450,
        width: 300,
        height: 50,
        text: '1 гравець',
        click: () => {
          this.gameState.newGame();
          this.sceneManager.loadScene(this.gameScene);
        }
      }),
      new Button({
        x: 0,
        y: 505,
        width: 300,
        height: 50,
        text: '2 гравця',
        click: () => {
          this.gameState.newGame();
          this.sceneManager.loadScene(this.gameScene);
        }
      }),
      new Button({
        x: 0,
        y: 560,
        width: 300,
        height: 50,
        text: 'Конструктор',
        click: () => {
          this.sceneManager.loadScene(this.constructorScene);
        }
      })
    ];
  }

  click({ x, y }) {
    for (const element of this.elements) {
      element.handleClick({ x, y });
    }
  }

  draw() {
    const ctx = this.canvas.getContext('2d');

    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    this.drawingContext.clear('#000');

    const LOGO_WIDTH = 655;
    const LOGO_HEIGHT = 287;
    const MENU_HEIGHT = 200;
    const offsetX = (this.drawingContext.width - LOGO_WIDTH) / 2;
    const offsetY = 50;
    this.drawingContext.drawImage(this.resourceManager.get(LOGO_SPRITES), offsetX, offsetY, LOGO_WIDTH, LOGO_HEIGHT);

    for (const element of this.elements) {
      element.x = offsetX + 200;
      element.draw(ctx);
    }
  }
}

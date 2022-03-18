import Scene from '../Scene.js';
import Tank from '../gameObjects/Tank.js';
import {
  TANK_PLAYER,
  SIDEBAR_WIDTH,
  FILENAME_SPRITES,
  DIRECTION_DOWN,
  DIRECTION_UP,
  DIRECTION_RIGHT,
  DIRECTION_LEFT,
  CELL_SIZE,
  MAP_SIZE,
  BG_COLOR
} from '../constants.js';
import AIPlayer from '../AIPlayer.js';

export default
class GameScene extends Scene {
  nextEnemyPlace = 1;

  isStarted = false;

  constructor({ DrawingContext, ResourceManager, GameMap, GameSidebar, Sounds, SceneManager, GameState }) {
    super();

    this.drawingContext = DrawingContext;
    this.resourceManager = ResourceManager;
    this.map = GameMap;
    this.sidebar = GameSidebar;
    this.sounds = Sounds;
    this.sceneManager = SceneManager;
    this.gameState = GameState;
  }

  drawStage() {
    let n = Date.now();
    const time = 500;
    this.sounds.play('start');
    return () => {
      let change = Date.now() - n;
      if (change > time) {
        change = time;
        setTimeout(() => {
          this.isStarted = true;
        }, 1000);
      }
      const height = (this.drawingContext.height / 2) * (change / time);
      this.drawingContext.clear('#000');
      this.drawingContext.drawRect(0, 0, this.drawingContext.width, height, '#0089fb');
      this.drawingContext.drawRect(0, this.drawingContext.height - height, this.drawingContext.width, this.drawingContext.height, '#ffda00');
      this.drawingContext.drawText(this.gameState.stage.title, this.drawingContext.width / 2, this.drawingContext.height / 2 - 20);
      this.drawingContext.drawText(this.gameState.stage.subtitle, this.drawingContext.width / 2, this.drawingContext.height / 2 + 40);
    };
  }

  async loading() {
    this.gameState.loadStage();

    await this.resourceManager.loadResources([
      FILENAME_SPRITES
    ]);
    //
    // const url = new URL(window.location);
    // let serverUrl = 'http://localhost:8080';
    // if (url.searchParams.has('gameId')) {
    //   serverUrl += `/?gameId=${url.searchParams.get('gameId')}`;
    // }
    // const source = new EventSource(serverUrl);
    // source.onmessage = ({ lastEventId, data }) => {
    //   if (!this.gameId) {
    //     url.searchParams.set('gameId', lastEventId);
    //     window.history.pushState({ gameId: lastEventId }, '', url);
    //   }
    //   this.gameId = lastEventId;
    //   const { cells, isActiveGame, turnKey, wonSide, state } = JSON.parse(data);
    //   this.cells = cells;
    //   this.isActiveGame = isActiveGame;
    //   this.turnKey = turnKey;
    //   this.wonSide = wonSide;
    //   this.state = state;
    //   if (this.isActiveGame) {
    //     this.audios[state].play();
    //   }
    // }

    this.playerTank = new Tank({
      x: 0,
      y: 0,
      type: TANK_PLAYER,
      direction: DIRECTION_UP,
      ResourceManager: this.resourceManager,
      Sounds: this.sounds,
      map: this.map,
      GameState: this.gameState
    });
    this.map.putPlayer1(this.playerTank);

    this.playerTank.born();
    this.map.isConstructor = false;
    // this.map.isDebug = true;

    this.map.putBase();
    this.map.putEnemiesPlaces();
    this.inputState = {
      isUp: false,
      isDown: false,
      isLeft: false,
      isRight: false,
      isShoot: false
    };

    this.timer = setInterval(() => {
      if (!this.gameState.tanks.length) {
        return;
      }
      const tank = this.gameState.tanks.shift();
      this.createEnemyTank(tank)
    }, this.gameState.enemyTankBornTimeout || 5000);
    this.onStartDraw = this.drawStage();
  }

  async draw() {
    if (!this.isStarted) {
      return this.onStartDraw();
    }

    const PADDING_SIZE = 20;

    this.drawingContext.clear(BG_COLOR);

    const windowWidth = this.drawingContext.width - (PADDING_SIZE * 2) - SIDEBAR_WIDTH;
    const windowHeight = this.drawingContext.height - (PADDING_SIZE * 2);
    const minSide = Math.min(windowWidth, windowHeight);

    // draw sidebar
    const offsetX = (this.drawingContext.width - minSide - SIDEBAR_WIDTH) / 2;
    const offsetY = (this.drawingContext.height - minSide) / 2;

    const img = this.map.draw();
    this.drawingContext.drawImage(img, offsetX, offsetY, minSide, minSide);

    const sidebar = this.sidebar.draw();
    this.drawingContext.drawImage(sidebar, offsetX + minSide, offsetY, sidebar.width * (minSide / sidebar.height), minSide);
  }

  changeState({
    Space,
    KeyW, ArrowUp,
    KeyS, ArrowDown,
    KeyA, ArrowLeft,
    KeyD, ArrowRight,
  }) {
    this.inputState.isShoot = Space;
    this.inputState.isUp = KeyW || ArrowUp;
    this.inputState.isDown = KeyS || ArrowDown;
    this.inputState.isLeft = KeyA || ArrowLeft;
    this.inputState.isRight = KeyD || ArrowRight;
  }

  tick() {
    for (const object of this.map.gameObjects) {
      object.tick();
    }

    if (this.inputState.isUp) {
      this.playerTank.move(DIRECTION_UP);
    } else if (this.inputState.isDown) {
      this.playerTank.move(DIRECTION_DOWN);
    } else if (this.inputState.isLeft) {
      this.playerTank.move(DIRECTION_LEFT);
    } else if (this.inputState.isRight) {
      this.playerTank.move(DIRECTION_RIGHT);
    } else {
      this.playerTank.stop();
    }

    if (this.inputState.isShoot) {
      this.playerTank.shoot();
    }
  }

  createEnemyTank(tankType) {
    let x = 0;
    let y = 0;

    if (this.nextEnemyPlace === 1) {
      x = (MAP_SIZE * CELL_SIZE) / 2 - 1;
    } else if (this.nextEnemyPlace === 2) {
      x = (MAP_SIZE - 2) * CELL_SIZE;
    }
    this.nextEnemyPlace++;
    if (this.nextEnemyPlace === 3) {
      this.nextEnemyPlace = 0;
    }

    const tank = new Tank({
      x,
      y,
      type: tankType,
      direction: DIRECTION_DOWN,
      ResourceManager: this.resourceManager,
      Sounds: this.sounds,
      map: this.map,
      GameState: this.gameState
    });
    tank.player = new AIPlayer({
      tank,
      map: this.map
    });
    tank.born(false);
    this.map.addObject(tank);
    this.map.world.addObject(tank.physicEntity);
  }

  //
  // click({ x, y }) {
  //   const cellIndex = Math.ceil(x / CELL_SIZE);
  //   const rowIndex = Math.ceil(y / CELL_SIZE);
  //   if (!this.isActiveGame) {
  //     return;
  //   }
  //   if (cellIndex > 3 || rowIndex > 3) {
  //     return;
  //   }
  //   const cellState = this.cells[rowIndex - 1][cellIndex - 1];
  //   if (cellState !== CELL_EMPTY || !this.turnKey) {
  //     return;
  //   }
  //   this.audios[this.state].play();
  //   fetch(SERVER_URL, {
  //     method: 'POST',
  //     body: JSON.stringify({
  //       row: rowIndex - 1,
  //       cell: cellIndex - 1,
  //       gameId: this.gameId,
  //       turnKey: this.turnKey
  //     })
  //   });
  // }
}

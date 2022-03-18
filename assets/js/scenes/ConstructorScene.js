import Scene from '../Scene.js';
import Tank from '../gameObjects/Tank.js';
import {
  TANK_PLAYER,
  SIDEBAR_WIDTH,
  FILENAME_SPRITES,
  MAP_SIZE, CELL_SIZE, MAP_OBJECT_BRICK, MAP_OBJECT_STEEL, MAP_OBJECT_EMPTY
} from '../constants.js';

const PADDING_SIZE = 20;

export default
class ConstructorScene extends Scene {
  gameObjects = [];

  constructor({ DrawingContext, ResourceManager, GameMap, ConstructorSidebar, Sounds }) {
    super();

    this.drawingContext = DrawingContext;
    this.resourceManager = ResourceManager;
    this.map = GameMap;
    this.sidebar = ConstructorSidebar;
    this.sounds = Sounds;
  }

  async loading() {
    // this.audios[CELL_X] = document.getElementById('audio_x');
    // this.audios[CELL_O] = document.getElementById('audio_o');

    await this.resourceManager.loadResources([
      FILENAME_SPRITES
    ]);
    this.map.setMap(Array(MAP_SIZE ** 2).fill(MAP_OBJECT_EMPTY));
    this.map.putBase();
    this.map.isConstructor = true;
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
  }

  move({ x, y }) {
    const { x: offsetX, y: offsetY } = this.mapToCanvas(x, y);

    this.map.highlight(offsetX, offsetY, this.sidebar.selectedTool);
  }

  mapToCanvas(x, y) {
    const windowWidth = this.drawingContext.width - (PADDING_SIZE * 2) - SIDEBAR_WIDTH;
    const windowHeight = this.drawingContext.height - (PADDING_SIZE * 2);
    const minSide = Math.min(windowWidth, windowHeight);

    // draw sidebar
    const offsetX = (this.drawingContext.width - minSide - SIDEBAR_WIDTH) / 2;
    const offsetY = (this.drawingContext.height - minSide) / 2;

    return {
      x: (x - offsetX) / (minSide / (MAP_SIZE * CELL_SIZE)),
      y: (y - offsetY) / (minSide / (MAP_SIZE * CELL_SIZE))
    };
  }

  async draw() {
    this.drawingContext.clear('#636363');

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


  click({ x, y }) {
    const windowWidth = this.drawingContext.width - (PADDING_SIZE * 2) - SIDEBAR_WIDTH;
    const windowHeight = this.drawingContext.height - (PADDING_SIZE * 2);
    const minSide = Math.min(windowWidth, windowHeight);
    const sidebarOffset = (this.drawingContext.width - minSide - SIDEBAR_WIDTH) / 2;

    this.sidebar.click({ x: x - sidebarOffset - minSide, y });

    const { x: offsetX, y: offsetY } = this.mapToCanvas(x, y);
    let res = this.map.getByRowCell(offsetX, offsetY);
    if (!res) {
      return;
    }

    if (this.sidebar.selectedTool === MAP_OBJECT_BRICK || this.sidebar.selectedTool === MAP_OBJECT_STEEL) {
      this.map.set(res.cell, res.row, this.sidebar.selectedTool);
    } else {
      res.cell = Math.floor(res.cell / 2) * 2;
      res.row = Math.floor(res.row / 2) * 2;
      this.map.set(res.cell, res.row, this.sidebar.selectedTool);
      this.map.set(res.cell + 1, res.row, this.sidebar.selectedTool);
      this.map.set(res.cell, res.row + 1, this.sidebar.selectedTool);
      this.map.set(res.cell + 1, res.row + 1, this.sidebar.selectedTool);
    }
    this.map.redrawMap();
  }
}

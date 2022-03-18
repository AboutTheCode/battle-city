import { STAGES } from './stages.js';
import { PLAYER_LIVES, TANK_HEAVY, TANK_MEDIUM, TANK_NORMAL, TANK_SWIFT } from './constants.js';

export default
class GameState {
  currentStage = 0;

  tanks = [];

  enemyTankBornTimeout = 5000;

  kills = {};

  killsScore = 0;

  constructor({ GameMap }) {
    this.map = GameMap;
  }

  newGame() {
    this.currentStage = 0;
    this.lives = PLAYER_LIVES;
  }

  loadStage() {
    this.stage = STAGES[this.currentStage];
    this.tanks = this.stage.tanks;
    this.enemyTankBornTimeout = this.stage.enemyTankBornTimeout;
    this.map.setMap(this.stage.map);
    this.killsScore = 0;
    this.kills = {
      [TANK_NORMAL]: 0,
      [TANK_SWIFT]: 0,
      [TANK_MEDIUM]: 0,
      [TANK_HEAVY]: 0
    };
  }
}

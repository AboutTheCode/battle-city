import EventEmitter from '../EventEmitter.js';

export default
class Element extends EventEmitter {
  constructor({ x, y, width, height, click }) {
    super();

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    if (click) {
      this.on('click', click);
    }
  }

  draw(ctx) {
  }

  click({ x, y }) {
    this.emit('click', { x, y });
  }

  isInBounds(x, y) {
    return x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height;
  }

  handleClick({ x, y }) {
    if (this.isInBounds(x, y)) {
      this.click({ x, y });
    }
  }
}

import Element from './Element.js';

export default
class Button extends Element {
  constructor({ text, ...params }) {
    super(params);

    this.text = text;
    this.state = 0;
  }

  draw(ctx) {
    super.draw(ctx);

    ctx.save();
    ctx.font = `normal 18px 'Press Start 2P'`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#636363';
    if (this.disabled) {
      ctx.fillStyle = '#636363';
    } else if (this.state) {
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = '#fff';
    } else {
      ctx.fillStyle = '#fff';
    }
    ctx.fillText(this.text, this.x + 20, this.y + this.height / 2);
    ctx.restore();
  }
}

import { Font, VirtualTerminal } from "./terminal.js";

/**
 * Terminal is responsible for buffering characters and then drawing
 * them to a canvas when it is refreshed.
 */
export class CanvasTerminal extends VirtualTerminal {
  constructor(settings) {
    super(settings);

    /**
     * @public
     */
    this.canvas = document.createElement("canvas");

    /**
     * @private
     */
    this.ctx = this.canvas.getContext("2d");

    /**
     * @private
     * @type {Map<string, HTMLCanvasElement>}
     * Cache of colored versions of the font.
     */
    this.colorCache = new Map();

    this.reset();
  }

  /**
   * @param {Font} font
   */
  setFont(font) {
    this.colorCache.clear();
    super.setFont(font);
  }

  /**
   * Reset the buffers and rescale the canvas.
   */
  reset() {
    super.reset();
    this.canvas.width = this.width * this.font.glyphWidth * this.scale;
    this.canvas.height = this.height * this.font.glyphHeight * this.scale;
    this.ctx.imageSmoothingEnabled = false;
    this.canvas.style.imageRendering = "pixelated";
  }

  /**
   * @protected
   */
  draw(sx, sy, sw, sh, dx, dy, dw, dh, fg, bg, char) {
    if (bg) {
      this.ctx.fillStyle = bg;
      this.ctx.fillRect(dx, dy, dw, dh);
    } else {
      this.ctx.clearRect(dx, dy, dw, dh);
    }

    // Don't bother trying to render 0/null
    if (char) {
      let img = this.tint(fg);
      this.ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    }
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  screenToGrid(x, y) {
    let { left, top } = this.canvas.getBoundingClientRect();
    return this.canvasToGrid(x - left, y - top);
  }

  /**
   * @private
   * @param {string} color
   * @return {HTMLCanvasElement}
   */
  tint(color) {
    if (!this.colorCache.has(color)) {
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");

      canvas.width = this.font.image.width;
      canvas.height = this.font.image.height;

      ctx.drawImage(this.font.image, 0, 0);
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      this.colorCache.set(color, canvas);
    }

    return this.colorCache.get(color);
  }
}

/**
 * Virtual terminal that doesn't have a renderer. Other terminals
 * should extend this and implement the `draw` method.
 */
export class VirtualTerminal {
  constructor({
    width = 80,
    height = 25,
    scale = 1,
    font = Font.default
  }) {
    this.font = font;
    this.scale = scale;
    this.width = width;
    this.height = height;

    /**
     * Front buffer is the current contents of the screen.
     *
     * Back buffer is what we're currently drawing to when we call put.
     *
     * @private
     */
    this.buffers = {
      front: new Buffer(width, height),
      back: new Buffer(width, height),
    };
  }

  /**
   * @param {Font} font
   */
  setFont(font) {
    this.font = font;
    this.reset();
  }

  /**
   * Reset the buffers and rescale the canvas.
   */
  reset() {
    this.buffers = {
      front: new Buffer(this.width, this.height),
      back: new Buffer(this.width, this.height),
    };
  }

  /**
   * @param {number} width
   * @param {number} height
   */
  resize(width, height) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  /**
   * @param {number} scale
   */
  rescale(scale) {
    this.scale = scale;
    this.reset();
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {string | number} char
   * @param {Ursine.Color} fg
   * @param {Ursine.Color} [bg]
   * @param {number} layer
   */
  put(x, y, char, fg, bg, layer = 0) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return;
    }

    let buffer = this.buffers.back;

    let i = x + y * this.width;

    if (layer < buffer.layer[i]) {
      return;
    }

    let code = typeof char === "string" ? char.charCodeAt(0) : char;

    buffer.chars[i] = code;
    buffer.foreground[i] = fg;
    buffer.layer[i] = layer;

    if (bg) {
      buffer.background[i] = bg;
    }
  }

  /**
   * Flush the changes in the back buffer to the rendering target.
   */
  refresh() {
    let { back, front } = this.buffers;

    let sw = this.font.glyphWidth;
    let sh = this.font.glyphHeight;
    let dw = sw * this.scale;
    let dh = sh * this.scale;

    let calls = 0;

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        let i = x + y * this.width;

        let char = back.chars[i];
        let fg = back.foreground[i];
        let bg = back.background[i];

        if (
          char === front.chars[i] &&
          fg === front.foreground[i] &&
          bg === front.background[i]
        ) {
          continue;
        }

        calls += 1;

        let dx = x * sw * this.scale;
        let dy = y * sh * this.scale;

        let sx = (char % this.font.columns) * sw;
        let sy = Math.floor(char / this.font.rows) * sh;

        this.draw(sx, sy, sw, sh, dx, dy, dw, dh, fg, bg, char);
      }
    }

    this.buffers.back = front;
    this.buffers.front = back;
    this.buffers.back.clear();

    if (calls > 0) {
      console.debug("draw", calls);
    }
  }

  /**
   * @protected
   * @abstract
   */
  draw(sx, sy, sw, sh, dx, dy, dw, dh, fg, bg, char) {}

  /**
   * @param {number} x
   * @param {number} y
   */
  canvasToGrid(x, y) {
    return {
      x: Math.floor(x / (this.font.glyphWidth * this.scale)),
      y: Math.floor(y / (this.font.glyphHeight * this.scale)),
    };
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  gridToCanvas(x, y) {
    return {
      x: x * this.font.glyphWidth * this.scale,
      y: y * this.font.glyphHeight * this.scale,
    };
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  screenToGrid(x, y) {
    return this.canvasToGrid(x, y);
  }
}

export class Font {
  static get default() {
    let img = new Image();
    img.src = "font.png";
    return new Font(img);
  }

  /**
   * @param {string} url
   * @param {number} [rows]
   * @param {number} [columns]
   */
  static async load(url, rows, columns) {
    let img = new Image();
    img.src = url;
    await (new Promise(resolve => img.onload = resolve));
    return new Font(img, rows, columns);
  }

  get glyphWidth() {
    return this.image.width / this.columns;
  }

  get glyphHeight() {
    return this.image.height / this.rows;
  }

  /**
   * @param {HTMLImageElement} image
   * @param {number} [rows]
   * @param {number} [columns]
   */
  constructor(image, rows = 16, columns = 16) {
    this.image = image;
    this.rows = rows;
    this.columns = columns;
  }
}

/**
 * The low level format for storing character data
 */
export class Buffer {
  /**
   * @param {number} width
   * @param {number} height
   */
  constructor(width, height) {
    let length = width * height;

    /**
     * @type {number}
     */
    this.width = width;

    /**
     * @type {number}
     */
    this.height = height;

    /**
     * @type {number[]}
     */
    this.chars = new Array(length);

    /**
     * @type {string[]}
     */
    this.foreground = new Array(length);

    /**
     * @type {string[]}
     */
    this.background = new Array(length);

    /**
     * @type {number[]}
     */
    this.layer = new Array(length);
  }

  clear() {
    this.chars.fill(undefined);
    this.foreground.fill(undefined);
    this.background.fill(undefined);
    this.layer.fill(0);
  }
}

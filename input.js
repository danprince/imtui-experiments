export class Mouse {
  constructor() {
    this.x = -1;
    this.y = -1;
    this.deltaX = 0;
    this.deltaY = 0;
    this.wheelX = 0;
    this.wheelY = 0;
    this.wheelZ = 0;

    /**
     * @type {number[]}
     */
    this.pressing = [];

    /**
     * @type {number[]}
     */
    this.releasing = [];

    /**
     * @type {number[]}
     */
    this.down = [];
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  setCursor(x, y) {
    this.deltaX = x - this.x;
    this.deltaY = y - this.y;
    this.x = x;
    this.y = y;
  }

  /**
   * @param {number} button
   */
  isPressing(button = Mouse.BTN_LEFT) {
    return this.pressing.includes(button);
  }

  /**
   * @param {number} button
   */
  isReleasing(button = Mouse.BTN_LEFT) {
    return this.releasing.includes(button);
  }

  /**
   * @param {number} button
   */
  isDown(button = Mouse.BTN_LEFT) {
    return this.down.includes(button);
  }

  /**
   * @param {number} button
   */
  press(button) {
    this.pressing.push(button);
    this.down.push(button);
  }

  /**
   * @param {number} button
   */
  release(button) {
    this.releasing.push(button);
    this.down = this.down.filter(btn => btn !== button);
    this.pressing = this.pressing.filter(btn => btn !== button);
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  scroll(x, y, z) {
    this.wheelX = x;
    this.wheelY = y;
    this.wheelZ = z;
  }

  /**
   * Reset the state of the mouse
   */
  reset() {
    this.pressing = [];
    this.releasing = [];
    this.wheelX = 0;
    this.wheelY = 0;
    this.wheelZ = 0;
  }
}

Mouse.BTN_LEFT = 0;
Mouse.BTN_MIDDLE = 1;
Mouse.BTN_RIGHT = 2;

export class Keyboard {
  constructor() {
    /**
     * @type {number[]}
     */
    this.pressing = [];

    /**
     * @type {number[]}
     */
    this.releasing = [];

    /**
     * @type {number[]}
     */
    this.down = [];
  }

  /**
   * @param {number} key
   */
  press(key) {
    if (!this.isDown(key)) {
      this.pressing.push(key);
      this.down.push(key);
    }
  }

  /**
   * @param {number} key
   */
  release(key) {
    this.releasing.push(key);
    this.down = this.down.filter(k => k !== key);
    this.pressing = this.pressing.filter(k => k !== key);
  }

  /**
   * @param {number} key
   */
  isDown(key) {
    return this.down.includes(key);
  }

  /**
   * @param {number} key
   */
  isPressing(key) {
    return this.pressing.includes(key);
  }

  /**
   * @param {number} key
   */
  isReleasing(key) {
    return this.releasing.includes(key);
  }

  /**
   *
   */
  reset() {
    this.pressing = [];
    this.releasing = [];
  }
}

Keyboard.KEY_ENTER = 13;
Keyboard.KEY_SHIFT = 8;

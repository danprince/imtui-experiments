import { VirtualTerminal } from "./terminal.js";
import { Mouse, Keyboard } from "./input.js";

export class UI {
  /**
   * @param {VirtualTerminal} terminal
   */
  constructor(terminal) {
    /**
     * @public
     */
    this.terminal = terminal;

    /**
     * @private
     * @type {View[]}
     */
    this.views = [];

    /**
     * @private
     * @type {Ursine.Rectangle[]}
     */
    this.boundingBoxes = [{
      x: 0,
      y: 0,
      width: Infinity,
      height: Infinity,
    }];

    this.mouse = new Mouse();

    this.keyboard = new Keyboard();

    /**
     * @private
     * @type {any[]}
     */
    this.namespaces = [];

    /**
     * @private
     * @type {any[]}
     */
    this.focusIds = [];

    /**
     * @public
     * @type {any}
     */
    this.focus = null;

    /**
     * @type {any}
     */
    this.hover = null;

    /**
     * @type {any}
     */
    this.active = null;

    /**
     * @private
     * @type {Ursine.Rectangle[]}
     */
    this.cullingRects = [];

    /**
     * @private
     * @type {Map<Ursine.Context<any>, any>}
     */
    this.context = new Map();

    /**
     * @private
     * @type {number[]}
     */
    this.layers = [0];

    this.dispatch = this.dispatch.bind(this);
    this.handleKeyboardEvent = this.handleKeyboardEvent.bind(this);
    this.handleMouseEvent = this.handleMouseEvent.bind(this);

    /**
     * Keep a reference to the current culling rect so that we don't
     * have to read it from the stack each time.
     *
     * @type {Ursine.Rect}
     */
    this.culling = null;

    /**
     * Keep a reference to the current bounding box so that we don't
     * have to read it from the stack each time.
     *
     * @type {Ursine.Rect}
     */
    this.box = this.boundingBoxes[0];

    this.addKeyboardListeners();
    this.addMouseListeners();
    this.enqueueRender();
  }

  get layer() {
    return this.layers[this.layers.length - 1];
  }

  /**
   * @param {View} view
   */
  pushView(view) {
    this.views.push(view);
    view.ui = this;
    view.enter();
    this.enqueueRender();
  }

  popView() {
    let view = this.views.pop();

    if (view) {
      view.exit();
      view.ui = null;
      this.enqueueRender();
    }
  }

  /**
   * @param {number} layer
   */
  pushLayer(layer) {
    this.layers.push(layer);
  }

  popLayer() {
    this.layers.pop();
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  pushCullingRect(x, y, width, height) {
    let box = this.box;

    let rect = {
      x: box.x + x,
      y: box.y + y,
      width,
      height,
    };

    this.cullingRects.push(rect);
    this.culling = rect;
  }

  popCullingRect() {
    this.cullingRects.pop();
    this.culling = this.cullingRects[this.cullingRects.length - 1];
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   *
   * Push a bounding box onto the stack
   */
  pushBoundingBox(x, y, width, height) {
    let current = this.box;

    let rect = {
      x: current.x + x,
      y: current.y + y,
      width,
      height,
    };

    this.boundingBoxes.push(rect);
    this.box = rect;
  }

  /**
   * Remove the current bounding box from the top of the stack.
   */
  popBoundingBox() {
    if (this.boundingBoxes.length > 1) {
      this.boundingBoxes.pop();
      this.box = this.boundingBoxes[this.boundingBoxes.length - 1];
    } else {
      throw new Error("Can't pop root bounding box");
    }
  }

  /**
   * @param {any} id
   */
  pushId(id) {
    this.namespaces.push(id);
  }

  popId() {
    this.namespaces.pop();
  }

  /**
   * Return a fully qualified version of the id, including all the
   * current namespaces.
   *
   * @param {any} id
   * @return {string}
   */
  getQualifiedId(id) {
    return [...this.namespaces, id].join("/");
  }

  /**
   * Put a character into the current terminal.
   *
   * @param {number} x
   * @param {number} y
   * @param {number | string} char
   * @param {Ursine.Color} fg
   * @param {Ursine.Color} [bg]
   */
  put(x, y, char, fg, bg, layer = 0) {
    let box = this.box;
    let cull = this.culling;

    x = box.x + x;
    y = box.y + y;

    if (cull && !isPointInRect(x, y, cull)) {
      return;
    }

    this.terminal.put(x, y, char, fg, bg, layer);
  }


  /**
   * Register a control that can receive focus.
   *
   * @param {any} id
   */
  pushFocusableControl(id) {
    this.focusIds.push(id);
  }

  /**
   * Move focus to the next control.
   */
  focusNextControl() {
    let index = this.focusIds.indexOf(this.focus);
    let end = this.focusIds.length - 1;
    let newIndex = index === end ? 0 : index + 1;
    this.focus = this.focusIds[newIndex];
  }

  /**
   * Move focus to the previous control.
   */
  focusPreviousControl() {
    let index = this.focusIds.indexOf(this.focus);
    let end = this.focusIds.length;
    let newIndex = (index ? index : end) - 1;
    this.focus = this.focusIds[newIndex];
  }

  /**
   * Dispatch an event to all active views.
   *
   * @param {any} event
   */
  dispatch(event) {
    for (let i = this.views.length - 1; i >= 0; i--) {
      let view = this.views[i];

      if (view.update(event) === true) {
        break;
      }
    }

    this.enqueueRender();
  }

  /**
   * Render the currently active views.
   */
  render() {
    UI.current = this;

    this.focusIds = [];

    this.pushBoundingBox(0, 0, this.terminal.width, this.terminal.height);

    for (let view of this.views) {
      view.render();
    }

    this.popBoundingBox();

    this.terminal.refresh();

    this.mouse.reset();
    this.keyboard.reset();

    UI.current = null;
  }

  /**
   * Queue up a render for the next animation frame
   */
  enqueueRender() {
    let renderAnimationFrame = () => this.render();
    requestAnimationFrame(renderAnimationFrame);
  }

  /**
   * Start listening for relevant mouse events.
   */
  addMouseListeners() {
    window.addEventListener("mousemove", this.handleMouseEvent);
    window.addEventListener("mouseup", this.handleMouseEvent);
    window.addEventListener("mousedown", this.handleMouseEvent);
    window.addEventListener("wheel", this.handleMouseEvent, { passive: false });
  }

  /**
   * Stop listening for mouse events
   */
  removeMouseListeners() {
    window.removeEventListener("mousemove", this.handleMouseEvent);
    window.removeEventListener("mouseup", this.handleMouseEvent);
    window.removeEventListener("mousedown", this.handleMouseEvent);
    window.removeEventListener("wheel", this.handleMouseEvent);
  }

  /**
   * Add listeners for keyboard events.
   */
  addKeyboardListeners() {
    window.addEventListener("keydown", this.handleKeyboardEvent);
    window.addEventListener("keyup", this.handleKeyboardEvent);
  }

  /**
   * Remove listeners for keyboard events.
   */
  removeKeyboardListeners() {
    window.removeEventListener("keydown", this.handleKeyboardEvent);
    window.removeEventListener("keyup", this.handleKeyboardEvent);
  }

  /**
   * Internal handler for mouse events.
   *
   * @private
   * @param {MouseEvent | WheelEvent} event
   */
  handleMouseEvent(event) {
    let { x, y } = this.terminal.screenToGrid(event.clientX, event.clientY);

    switch (event.type) {
      case "mousedown":
        this.mouse.press(event.button);
        break;

      case "mouseup":
        this.mouse.release(event.button);
        break;

      case "wheel":
        if (event instanceof WheelEvent) {
          this.mouse.scroll(event.deltaX, event.deltaY, event.deltaZ);
          //event.preventDefault();
          break;
        }
    }

    let previousMouseX = this.mouse.x;
    let previousMouseY = this.mouse.y;

    this.mouse.setCursor(x, y);

    // Skip render if the mouse moved, but stayed in the same cell.

    if (
      event.type !== "mousemove" ||
      this.mouse.x !== previousMouseX ||
      this.mouse.y !== previousMouseY
    ) {
      this.enqueueRender();
    }
  }

  /**
   * Internal handler for keyboard events.
   *
   * @private
   * @param {KeyboardEvent} event
   */
  handleKeyboardEvent(event) {
    switch (event.type) {
      case "keydown":
        this.keyboard.press(event.which);
        break;
      case "keyup":
        this.keyboard.release(event.which);
        break;
    }

    if (event.type === "keydown" && event.key === "Tab") {
      if (event.shiftKey) {
        this.focusPreviousControl();
      } else {
        this.focusNextControl();
      }

      event.preventDefault();
    }

    this.enqueueRender();
  }

  /**
   * Check whether the mouse is inside a rectangle relative to the current
   * bounding box.
   *
   * Defaults to checking whether the mouse is inside the current bounding
   * box.
   */
  isMouseOver(x = 0, y = 0, width = this.box.width, height = this.box.height) {
    let x0 = this.box.x + x;
    let y0 = this.box.y + y;
    let x1 = x0 + width - 1;
    let y1 = y0 + height - 1;
    return isPointInside(this.mouse.x, this.mouse.y, x0, y0, x1, y1);
  }

  /**
   * Push a value onto the context stack.
   *
   * @template T
   * @param {Ursine.Context<T>} contextType
   * @param {T} value
   */
  pushContext(contextType, value) {
    let stack = this.context.get(contextType) || [];
    stack.push(value);
    this.context.set(contextType, stack);
  }

  /**
   * @template T
   * @param {Ursine.Context<T>} contextType
   * @return {T}
   */
  getContext(contextType) {
    let stack = this.context.get(contextType);

    if (stack && stack.length) {
      return stack[stack.length - 1];
    } else {
      return contextType.defaultValue;
    }
  }

  /**
   * @param {Ursine.Context<any>} contextType
   */
  popContext(contextType) {
    let stack = this.context.get(contextType);
    stack.pop();
  }
}

/**
 * @type {UI}
 */
UI.current = null;

/**
 * @abstract
 */
export class View {
  constructor() {
    /**
     * @type {UI}
     */
    this.ui = null;
  }

  /**
   * @param {any} event
   * @return {any}
   */
  update(event) {
    return false
  }

  /**
   * @param {View} view
   */
  push(view) {
    this.ui.pushView(view);
  }

  pop() {
    this.ui.popView();
  }

  /**
   * @param {View} view
   */
  replace(view) {
    let ui = this.ui;
    ui.popView();
    ui.pushView(view);
  }

  enter() {}
  exit() {}
  render() {}
}

/**
 * @param {Ursine.Style[]} styles
 */
export function mergeStyles(...styles) {
  let target = {};

  for (let style of styles) {
    if (style) {
      Object.assign(target, style);
    }
  }

  return target;
}

/**
 * Create a context type that can be used to identify context values.
 *
 * @template T
 * @param {T} [defaultValue]
 * @return {Ursine.Context<T>}
 */
export function createContext(defaultValue) {
  return { defaultValue };
}

/**
 * Check whether a point is within a rectangle.
 *
 * @param {number} x
 * @param {number} y
 * @param {Ursine.Rectangle} rect
 * @return {boolean}
 */
export function isPointInRect(x, y, rect) {
  return (
    x >= rect.x &&
    y >= rect.y &&
    x < rect.x + rect.width &&
    y < rect.y + rect.height
  );
}

/**
 * Check whether a point is within an explicit bounding box.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 */
export function isPointInside(x, y, x0, y0, x1, y1) {
  return (
    x >= x0 &&
    y >= y0 &&
    x <= x1 &&
    y <= y1
  );
}

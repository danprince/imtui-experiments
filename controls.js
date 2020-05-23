import { UI, mergeStyles } from "./ui.js";
import { Keyboard } from "./input.js";
import * as Layout from "./layout.js";

/**
 * Groups related controls together under a shared id namespace.
 *
 * @param {object} props
 * @param {UI} [props.ui]
 * @param {Ursine.Id} [props.id]
 * @param {number} [props.x]
 * @param {number} [props.y]
 * @param {number} [props.width]
 * @param {number} [props.height]
 * @param {() => any} render
 */
export function Group({
  ui = UI.current,
  id,
  x = 0,
  y = 0,
  width = ui.box.width,
  height = ui.box.height,
}, render) {
  if (id != null) {
    ui.pushId(id);
  }

  ui.pushBoundingBox(x, y, width, height);
  render();
  ui.popBoundingBox();

  if (id != null) {
    ui.popId();
  }
}

/**
 * Draw a rectangle and push its bounds onto the bounding box stack.
 *
 * @param {object} props props
 * @param {UI} [props.ui]
 * @param {number} [props.x]
 * @param {number} [props.y]
 * @param {number} [props.width]
 * @param {number} [props.height]
 * @param {number} [props.padding]
 * @param {number} [props.paddingLeft]
 * @param {number} [props.paddingRight]
 * @param {number} [props.paddingTop]
 * @param {number} [props.paddingBottom]
 * @param {Ursine.FlexJustify} [props.justifySelf]
 * @param {Ursine.FlexAlign} [props.alignSelf]
 * @param {() => any} [render]
 */
export function Box({
  ui = UI.current,
  x = 0,
  y = 0,
  width = ui.box.width,
  height = ui.box.height,
  padding = 0,
  paddingLeft = padding,
  paddingRight = padding,
  paddingTop = padding,
  paddingBottom = padding,
  alignSelf,
  justifySelf,
  bg,
}, render) {
  let parent = ui.box;
  let child = { x, y, width, height };
  let bounds = Layout.getAlignedBounds(parent, child, justifySelf, alignSelf);
  ui.pushBoundingBox(bounds.x, bounds.y, bounds.width, bounds.height);

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      ui.put(i, j, 0, null, bg);
    }
  }

  if (render) {
    ui.pushBoundingBox(
      paddingLeft,
      paddingTop,
      width - paddingRight - 1,
      height - paddingBottom - 1
    );

    render();
    ui.popBoundingBox();
  }

  ui.popBoundingBox();
}

/**
 * Draw a frame and push its inner bounds onto the bounding box stack.
 *
 * @param {Object} props
 * @param {UI} [props.ui]
 * @param {number} [props.x]
 * @param {number} [props.y]
 * @param {number} [props.width]
 * @param {number} [props.height]
 * @param {Ursine.Color} [props.fg]
 * @param {Ursine.Color} [props.bg]
 * @param {Ursine.Char} [props.charTopLeft]
 * @param {Ursine.Char} [props.charTop]
 * @param {Ursine.Char} [props.charTopRight]
 * @param {Ursine.Char} [props.charLeft]
 * @param {Ursine.Char} [props.charRight]
 * @param {Ursine.Char} [props.charBottomLeft]
 * @param {Ursine.Char} [props.charBottom]
 * @param {Ursine.Char} [props.charBottomRight]
 * @param {() => any} [render]
 */
export function Frame({
  ui = UI.current,
  x = 0,
  y = 0,
  width = ui.box.width,
  height = ui.box.height,
  fg,
  bg,
  charTopLeft = 134,
  charTop = 133,
  charTopRight = 131,
  charLeft = 138,
  charRight = 138,
  charBottomLeft = 140,
  charBottom = 133,
  charBottomRight = 137
}, render) {
  ui.pushBoundingBox(x, y, width, height);

  let x0 = 0;
  let y0 = 0;
  let x1 = width - 1;
  let y1 = height - 1;

  ui.put(x0, y0, charTopLeft, fg, bg);
  ui.put(x1, y0, charTopRight, fg, bg);
  ui.put(x0, y1, charBottomLeft, fg, bg);
  ui.put(x1, y1, charBottomRight, fg, bg);

  for (let x = x0 + 1; x < x1; x++) {
    ui.put(x, y0, charTop, fg, bg);
    ui.put(x, y1, charBottom, fg, bg);
  }

  for (let y = y0 + 1; y < y1; y++) {
    ui.put(x0, y, charLeft, fg, bg);
    ui.put(x1, y, charRight, fg, bg);
  }

  if (render) {
    ui.pushBoundingBox(1, 1, width - 2, height - 2);
    render();
    ui.popBoundingBox();
  }

  ui.popBoundingBox();
}

/**
 * Draw text and allow the lines to wrap when they reach the edges
 * of the specified bounds.
 *
 * @param {Object} props
 * @param {UI} [props.ui]
 * @param {string} props.text
 * @param {number} [props.x]
 * @param {number} [props.y]
 * @param {number} [props.width]
 * @param {number} [props.height]
 * @param {Ursine.Color} [props.fg]
 * @param {Ursine.Color} [props.bg]
 */
export function Text({
  ui = UI.current,
  text,
  x = 0,
  y = 0,
  width = text.length,
  height = 1,
  fg,
  bg,
}) {
  ui.pushBoundingBox(x, y, width, height);

  for (let i = 0; i < text.length; i++) {
    ui.put(i, 0, text[i], fg, bg);
  }

  ui.popBoundingBox();
}

/**
 * Draw text and allow the lines to wrap when they reach the edges
 * of the specified bounds.
 *
 * @param {Object} props
 * @param {UI} [props.ui]
 * @param {string} props.text
 * @param {number} [props.x]
 * @param {number} [props.y]
 * @param {number} [props.width]
 * @param {number} [props.height]
 * @param {Ursine.Color} [props.fg]
 * @param {Ursine.Color} [props.bg]
 * @param {"soft" | "hard"} [props.wrap]
 */
export function WrappedText({
  ui = UI.current,
  text,
  x = 0,
  y = 0,
  width = ui.box.width,
  height = ui.box.height,
  wrap = "soft",
  fg,
  bg,
}) {
  ui.pushBoundingBox(x, y, width, height);

  let lines = [];

  switch (wrap) {
    case "soft":
      lines = Layout.softWrapText(text, width);
      break;
    case "hard":
      lines = Layout.hardWrapText(text, width);
      break;
  }

  for (let j = 0; j < lines.length; j++) {
    let line = lines[j];

    for (let i = 0; i < line.length; i++) {
      let char = line[i];
      ui.put(i, j, char, fg, bg);
    }
  }

  ui.popBoundingBox();
}

/**
 * @typedef FocusableState
 * @property {Ursine.Id} id
 * @property {boolean} active
 * @property {boolean} hover
 * @property {boolean} focus
 */

/**
 * Adds a focusable region for an input. Requires the input a unique id.
 *
 * @param {Object} props
 * @param {UI} [props.ui]
 * @param {Ursine.Id} [props.id]
 * @param {number} [props.x]
 * @param {number} [props.y]
 * @param {number} [props.width]
 * @param {number} [props.height]
 * @param {(state: FocusableState) => any} render
 */
export function Focusable({
  ui = UI.current,
  id,
  x = 0,
  y = 0,
  width = ui.box.width,
  height = ui.box.height,
}, render) {
  if (id == null) {
    throw new Error(`Focusable control must have an ID!`);
  }

  id = ui.getQualifiedId(id);

  ui.pushBoundingBox(x, y, width, height);
  ui.pushFocusableControl(id);

  let mouseIsOver = ui.isMouseOver();

  if (mouseIsOver) {
    ui.hover = id;
  }

  if (ui.hover === id && !mouseIsOver) {
    ui.hover = null;
  }

  if (mouseIsOver && ui.mouse.isDown()) {
    ui.focus = id;
  }

  if (mouseIsOver && ui.mouse.isPressing()) {
    ui.active = id;
  }

  if (ui.focus === id && ui.hover !== id && ui.mouse.isPressing()) {
    ui.focus = null;
  }

  if (ui.focus === id && ui.keyboard.isPressing(Keyboard.KEY_ENTER)) {
    ui.active = id;
  }

  if (ui.active === id && ui.keyboard.isReleasing(Keyboard.KEY_ENTER)) {
    ui.active = null;
  }

  if (ui.active === id && ui.mouse.isReleasing()) {
    ui.active = null;
  }

  let returned = render({
    id,
    focus: ui.focus === id,
    hover: ui.hover === id,
    active: ui.active === id,
  });

  ui.popBoundingBox();

  return returned;
}

/**
 * A clickable button.
 *
 * @param {Object} props
 * @param {UI} [props.ui]
 * @param {Ursine.Id} props.id
 * @param {string} props.text
 * @param {number} [props.x]
 * @param {number} [props.y]
 * @param {number} [props.width]
 * @param {number} [props.height]
 * @param {Ursine.Style} [props.defaultStyle]
 * @param {Ursine.Style} [props.hoverStyle]
 * @param {Ursine.Style} [props.focusStyle]
 * @param {Ursine.Style} [props.activeStyle]
 * @param {Ursine.Style} [props.style]
 * @return {boolean} - True when the button is pressed
 */
export function Button({
  ui = UI.current,
  id,
  text,
  x = 0,
  y = 0,
  width = text.length,
  height = 1,
  defaultStyle = { fg: "black" },
  hoverStyle = { bg: "#eee" },
  focusStyle = { bg: "#ccc" },
  activeStyle = {},
  style = {},
}) {
  let clicked = false;

  Focusable({ id, x, y, width, height }, ({ active, focus, hover }) => {
    clicked = (
      (hover && ui.mouse.isReleasing()) ||
      (focus && ui.keyboard.isReleasing(Keyboard.KEY_ENTER))
    );

    let styles = mergeStyles(
      defaultStyle,
      hover && hoverStyle,
      focus && focusStyle,
      active && activeStyle,
      style,
    );

    Box({ width, height, bg: styles.bg }, () => {
      Text({ text: text, fg: styles.fg });
    });
  });

  return clicked;
}

/**
 * A horizontal slider.
 *
 * @param {Object} props
 * @param {UI} [props.ui]
 * @param {Ursine.Id} props.id
 * @param {number} props.value
 * @param {number} props.min
 * @param {number} props.max
 * @param {number} [props.step]
 * @param {number} [props.length]
 * @param {number} [props.x]
 * @param {number} [props.y]
 * @param {Ursine.Char} [props.charTrack]
 * @param {Ursine.Char} [props.charTrackStart]
 * @param {Ursine.Char} [props.charTrackEnd]
 * @param {Ursine.Char} [props.charHandle]
 * @param {Ursine.Style} [props.trackStyle]
 * @param {Ursine.Style} [props.trackFillStyle]
 * @param {Ursine.Style} [props.trackFocusStyle]
 * @param {Ursine.Style} [props.trackHoverStyle]
 * @param {Ursine.Style} [props.trackActiveStyle]
 * @param {Ursine.Style} [props.handleStyle]
 * @param {Ursine.Style} [props.handleFocusStyle]
 * @param {Ursine.Style} [props.handleActiveStyle]
 * @param {Ursine.Style} [props.handleHoverStyle]
 *
 * @return {number} - The current value
 */
export function HorizontalSlider({
  ui = UI.current,
  id,
  value,
  max,
  min,
  length = 10,
  step = ((max - min) / length) / 10,
  x = 0,
  y = 0,
  charTrack = 133,
  charTrackStart = 132,
  charTrackEnd = 129,
  charHandle = 4,
  trackStyle = { bg: "white", fg: "#ddd" },
  trackFillStyle = { fg: "black" },
  trackFocusStyle = { bg: "#eee" },
  trackHoverStyle = {},
  trackActiveStyle = {},
  handleStyle = { fg: "black" },
  handleFocusStyle = {},
  handleActiveStyle = {},
  handleHoverStyle = {},
}) {
  Focusable({ id, x, y, width: length, height: 1 }, ({ active, focus, hover }) => {
    let cursor = ui.mouse.x - ui.box.x;

    if (active && ui.mouse.isDown()) {
      value = min + ((cursor / length) * (max - min));
    }

    if (focus && ui.keyboard.isDown(37)) {
      value -= step;
    }

    if (focus && ui.keyboard.isDown(39)) {
      value += step;
    }

    if (hover) {
      value += (ui.mouse.wheelX * step);
    }

    value = Math.max(min, value);
    value = Math.min(max, value);

    // Prevent floating point weirdness
    value = Math.floor(value * 100) / 100;

    let percentage = (value - min) / (max - min);
    let handle = Math.round(percentage * length);

    // Don't allow handle to render outside the bar
    handle = Math.min(handle, length - 1);

    for (let i = 0; i < length; i++) {
      let char = charTrack;
      if (i === 0) char = charTrackStart;
      if (i === length - 1) char = charTrackEnd;

      let filled = i <= handle;

      let trackStyles = mergeStyles(
        trackStyle,
        filled && trackFillStyle,
        focus && trackFocusStyle,
        active && trackActiveStyle,
        hover && trackHoverStyle,
      );

      ui.put(i, 0, char, trackStyles.fg, trackStyles.bg);
    }

    let handleStyles = mergeStyles(
      handleStyle,
      focus && handleFocusStyle,
      active && handleActiveStyle,
      hover && handleHoverStyle,
    );

    ui.put(handle, 0, charHandle, handleStyles.fg, handleStyles.bg);
  });

  return value;
}

/**
 * A checkbox slider. Returns the current state as a boolean.
 *
 * @param {Object} props
 * @param {UI} [props.ui]
 * @param {Ursine.Id} props.id
 * @param {boolean} props.value
 * @param {number} [props.x]
 * @param {number} [props.y]
 * @param {Ursine.Char} [props.charChecked]
 * @param {Ursine.Char} [props.charEmpty]
 * @param {Ursine.Style} [props.defaultStyle]
 * @param {Ursine.Style} [props.hoverStyle]
 * @param {Ursine.Style} [props.focusStyle]
 * @param {Ursine.Style} [props.checkedStyle]
 */
export function Checkbox({
  ui = UI.current,
  id,
  value,
  x = 0,
  y = 0,
  charChecked = 158,
  charEmpty = 158,
  defaultStyle = { fg: "#ddd" },
  hoverStyle = { fg: "#ddd" },
  focusStyle = { fg: "#777" },
  checkedStyle = { fg: "black" },
}) {
  Focusable({ id, x, y, width: 1, height: 1 }, ({ focus, hover }) => {
    let char = value ? charChecked : charEmpty;

    let styles = mergeStyles(
      defaultStyle,
      hover && hoverStyle,
      focus && focusStyle,
      value && checkedStyle,
    );

    if (hover && ui.mouse.isPressing()) {
      value = !value;
    }

    if (focus && ui.keyboard.isDown(Keyboard.KEY_ENTER)) {
      value = !value;
    }

    if (focus && ui.keyboard.isDown(40)) {
      ui.focusNextControl();
    }

    if (focus && ui.keyboard.isDown(38)) {
      ui.focusPreviousControl();
    }

    ui.put(0, 0, char, styles.fg, styles.bg);
  });

  return value;
}

/**
 * A radio button control.
 *
 * @param {Object} props
 * @param {UI} [props.ui]
 * @param {Ursine.Id} props.id
 * @param {any} props.value
 * @param {number} [props.x]
 * @param {number} [props.y]
 * @param {Ursine.Char} [props.charChecked]
 * @param {Ursine.Char} [props.charEmpty]
 * @param {Ursine.Style} [props.defaultStyle]
 * @param {Ursine.Style} [props.hoverStyle]
 * @param {Ursine.Style} [props.focusStyle]
 * @param {Ursine.Style} [props.checkedStyle]
 * @return {any} - The selected value
 */
export function RadioButton({
  ui = UI.current,
  id,
  value,
  x = 0,
  y = 0,
  charChecked = 156,
  charEmpty = 156,
  defaultStyle = { fg: "#ddd" },
  hoverStyle = { fg: "#ddd" },
  focusStyle = { fg: "#aaa" },
  checkedStyle = { fg: "black" },
}) {
  Focusable({ id, x, y, width: 1, height: 1 }, ({ focus, hover }) => {
    let char = value === id ? charChecked : charEmpty;

    let styles = mergeStyles(
      defaultStyle,
      hover && hoverStyle,
      focus && focusStyle,
      value === id && checkedStyle,
    );

    if (hover && ui.mouse.isPressing()) {
      value = id;
    }

    if (focus && ui.keyboard.isDown(Keyboard.KEY_ENTER)) {
      value = id;
    }

    ui.put(0, 0, char, styles.fg, styles.bg);
  });

  return value;
}

/**
 * @typedef Tab
 * @property {string} name
 * @property {any} id
 * @property {() => any} render
 */

/**
 * @param {Tab} tab
 */
function defaultTabRenderer(tab) {
  if (tab) {
    tab.render();
  }
}

/**
 * @param {object} props
 * @param {UI} [props.ui]
 * @param {any} [props.defaultTabId]
 * @param {any} [props.activeTabId]
 * @param {number} [props.x]
 * @param {number} [props.y]
 * @param {number} [props.width]
 * @param {number} [props.height]
 * @param {Tab[]} props.tabs
 * @param {Ursine.Style} [props.tabStyle]
 * @param {Ursine.Style} [props.tabStyleActive]
 * @param {(tab: Tab) => any} [props.renderTab]
 * @return {any} - The id of the active tab
 */
export function Tabs({
  ui = UI.current,
  defaultTabId,
  activeTabId = defaultTabId,
  x = 0,
  y = 0,
  width = ui.box.width,
  height = ui.box.height,
  tabs,
  tabStyle = {},
  tabStyleActive = { bg: "black", fg: "white" },
  renderTab = defaultTabRenderer,
}) {
  ui.pushBoundingBox(x, y, width, height);

  let cx = 0;

  for (let tab of tabs) {
    let isActive = tab.id === activeTabId;

    let tabStyles = mergeStyles(tabStyle, isActive && tabStyleActive);

    if (Button({
      id: tab.id,
      x: cx,
      text: tab.name,
      style: tabStyles,
    })) {
      activeTabId = tab.id;
      // Need to render so that the tab style updates
      ui.enqueueRender();
    }

    cx += tab.name.length + 1;
  }

  let tab = tabs.find(tab => tab.id === activeTabId);

  ui.pushBoundingBox(x, y + 1, width, height - 1);
  renderTab(tab);
  ui.popBoundingBox();

  ui.popBoundingBox();

  return activeTabId;
}

/**
 * @param {object} props
 * @param {UI} [props.ui]
 * @param {number} [props.x]
 * @param {number} [props.y]
 * @return {number} - The currently selected char
 */
export function FontPicker({
  ui = UI.current,
  x = 0,
  y = 0,
}) {
  let { font } = ui.terminal;
  let char;

  Group({ x, y, width: font.columns + 1, height: font.rows + 1 }, () => {
    let cursorX = ui.mouse.x - ui.box.x;
    let cursorY = ui.mouse.y - ui.box.y;

    for (let x = 0; x < font.columns; x++) {
      let hex = x.toString(16);
      let color = cursorX === x ? "black" : "#999";
      ui.put(x, -1, hex[0], color);
    }

    for (let y = 0; y < font.rows; y++) {
      let hex = y.toString(16);
      let color = cursorY === y ? "black" : "#999";
      ui.put(-1, y, hex[0], color);
    }

    for (let x = 0; x < font.columns; x++) {
      for (let y = 0; y < font.rows; y++) {
        let i = x + y * font.columns;
        let active = cursorX === x && cursorY === y;
        let fg = active ? "white" : "black";
        let bg = active ? "black" : "white";

        ui.put(x, y, i, fg, bg);
      }
    }

    if (
      cursorX >= 0 &&
      cursorY >= 0 &&
      cursorX < font.columns &&
      cursorY < font.rows
    ) {
      char = cursorX + cursorY * font.columns;
    }
  });

  return char;
}

/**
 * @typedef FlexChild
 * @property {(width: number, height: number) => any} render
 */

/**
 * @param {object} props
 * @param {UI} [props.ui]
 * @param {number} [props.x]
 * @param {number} [props.y]
 * @param {number} [props.width]
 * @param {number} [props.height]
 * @param {Ursine.FlexJustify} [props.justify]
 * @param {Ursine.FlexAlign} [props.align]
 * @param {Ursine.FlexDirection} [props.direction]
 * @param {number} [props.basis]
 * @param {(Ursine.FlexItem & FlexChild)[]} props.children
 */
export function Flex({
  ui = UI.current,
  x = 0,
  y = 0,
  width = ui.box.width,
  height = ui.box.height,
  justify = "stretch",
  align = "stretch",
  direction = "row",
  basis = 1,
  children,
}) {
  Layout.flex(width, height, basis, direction, align, justify, children);

  ui.pushBoundingBox(x, y, width, height);

  for (let child of children) {
    ui.pushBoundingBox(child.x, child.y, child.width, child.height);
    child.render(child.width, child.height);
    ui.popBoundingBox();
  }

  ui.popBoundingBox();
}

/**
 * @param {object} props
 * @param {UI} [props.ui]
 * @param {number} [props.x]
 * @param {number} [props.y]
 * @param {number} [props.length]
 * @param {Ursine.Color} [props.fg]
 * @param {Ursine.Color} [props.bg]
 * @param {Ursine.Char} [props.char]
 * @param {Ursine.Char} [props.charStart]
 * @param {Ursine.Char} [props.charEnd]
 */
export function HorizontalLine({
  ui = UI.current,
  x = 0,
  y = 0,
  length = ui.box.width,
  fg,
  bg,
  char = 133,
  charStart = 132,
  charEnd = 129,
}) {
  for (let i = 0; i < length; i++) {
    let c = char;
    if (i === 0) c = charStart;
    if (i === length - 1) c = charEnd;
    ui.put(x + i, y, c, fg, bg);
  }
}

/**
 * @param {object} props
 * @param {UI} [props.ui]
 * @param {number} [props.x]
 * @param {number} [props.y]
 * @param {number} [props.width]
 * @param {number} [props.height]
 * @param {number} [props.scrollX]
 * @param {number} [props.scrollY]
 * @param {number} [props.scrollWidth]
 * @param {number} [props.scrollHeight]
 * @param {boolean} [props.disableScrollX]
 * @param {boolean} [props.disableScrollY]
 * @param {() => any} render
 * @return {[number, number]} - Current scroll offsets
 */
export function ScrollView({
  ui = UI.current,
  x = 0,
  y = 0,
  width = ui.box.width,
  height = ui.box.height,
  scrollX,
  scrollY,
  scrollWidth = width,
  scrollHeight = height,
  disableScrollX = false,
  disableScrollY = false,
}, render) {
  if (ui.isMouseOver(x, y, width, height)) {
    let { wheelX, wheelY } = ui.mouse;

    if (Math.abs(wheelX) > Math.abs(wheelY)) {
      scrollX -= wheelX;
    } else {
      scrollY -= wheelY;
    }

    scrollX = Math.min(scrollX, 0);
    scrollY = Math.min(scrollY, 0);

    scrollX = Math.max(scrollX, width - scrollWidth);
    scrollY = Math.max(scrollY, height - scrollHeight);
  }

  let canScrollY = !disableScrollY && height < scrollHeight;
  let canScrollX = !disableScrollX && width < scrollWidth;

  if (!canScrollX) scrollX = 0;
  if (!canScrollY) scrollY = 0;

  let cullWidth = width;
  let cullHeight = height;

  if (canScrollX) {
    let length = width;
    let handle = Math.round((-scrollX / scrollWidth) * length);
    let handleLength = Math.ceil((width / scrollWidth) * length);

    HorizontalScrollBar({
      x: 0,
      y: height - 1,
      length,
      handle,
      handleLength,
    });

    cullHeight -= 1
  }

  if (canScrollY) {
    let length = height;
    let handle = Math.round((-scrollY / scrollHeight) * length);
    let handleLength = Math.ceil((height / scrollHeight) * length);

    VerticalScrollBar({
      x: width - 1,
      y: 0,
      length,
      handle,
      handleLength,
    });

    cullWidth -= 1;
  }

  ui.pushCullingRect(0, 0, cullWidth, cullHeight);

  ui.pushBoundingBox(
    x + scrollX,
    y + scrollY,
    scrollWidth,
    scrollHeight,
  );

  render();

  ui.popBoundingBox();
  ui.popCullingRect();

  return [scrollX, scrollY];
}

/**
 * @param {object} props
 * @param {UI} [props.ui]
 * @param {number} [props.x]
 * @param {number} [props.y]
 * @param {number} [props.length]
 * @param {number} [props.handle]
 * @param {number} [props.handleLength]
 * @param {Ursine.Style} [props.trackStyle]
 * @param {Ursine.Style} [props.handleStyle]
 */
export function VerticalScrollBar({
  ui = UI.current,
  x = 0,
  y = 0,
  length = ui.box.height,
  handle,
  handleLength,
  trackStyle = { bg: "#ddd" },
  handleStyle = { bg: "#888" },
}) {
  // Prevent handle from overflowing the bar
  handleLength = Math.min(length - handle, handleLength);

  Box({ x, y, width: 1, height: length, ...trackStyle });
  Box({ x, y: handle, width: 1, height: handleLength, ...handleStyle });
}

/**
 * @param {object} props
 * @param {UI} [props.ui]
 * @param {number} [props.x]
 * @param {number} [props.y]
 * @param {number} [props.length]
 * @param {number} [props.handle]
 * @param {number} [props.handleLength]
 * @param {Ursine.Style} [props.trackStyle]
 * @param {Ursine.Style} [props.handleStyle]
 */
export function HorizontalScrollBar({
  ui = UI.current,
  x = 0,
  y = 0,
  length = ui.box.width,
  handle,
  handleLength,
  trackStyle = { bg: "#ddd" },
  handleStyle = { bg: "#888" },
}) {
  // Prevent handle from overflowing the bar
  handleLength = Math.min(length - handle, handleLength);

  Box({ x, y, width: length, height: 1, ...trackStyle });
  Box({ x: handle, y, width: handleLength, height: 1, ...handleStyle });
}

/**
 * @template {any} T
 * @typedef {object} SelectableListItem
 * @property {any} [id]
 * @property {T} [value]
 * @property {string} [label]
 */

/**
 * @template T
 * @param {object} props
 * @param {UI} [props.ui]
 * @param {any} props.id
 * @param {T} props.value
 * @param {T} [props.defaultValue]
 * @param {SelectableListItem<T>[]} props.items
 * @param {number} [props.x]
 * @param {number} [props.y]
 * @param {number} [props.width]
 * @param {number} [props.height]
 * @return {T} - The selected value
 */
export function SelectableList({
  ui = UI.current,
  id,
  defaultValue,
  value = defaultValue,
  items = [],
  x = 0,
  y = 0,
  width = ui.box.width,
  height = ui.box.height,
}) {
  ui.pushId(id);
  ui.pushBoundingBox(x, y, width, height);

  for (let j = 0; j < items.length; j++) {
    let item = items[j];
    let selected = item.value === value;

    let style = selected
      ? { bg: "black", fg: "white" }
      : { fg: "black" };

    let label = String(item.label || item.value || item.id);

    if (Button({ id: j, y: j, text: label, width, style })) {
      value = item.value;
      ui.enqueueRender();
    }
  }

  ui.popBoundingBox();
  ui.popId();

  return value;
}

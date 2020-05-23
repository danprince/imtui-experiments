/**
 * @param {string} text
 * @param {number} width
 */
export function softWrapText(text, width) {
  let lines = [];
  let line = "";

  for (let i = 0; i < text.length; i++) {
    let char = text[i];

    if (char === "\n") {
      lines.push(line);
      line = "";
    } else {
      line += char;
    }

    if (line.length === width) {
      lines.push(line);
      line = "";
    }
  }

  lines.push(line);

  return lines;
}

/**
 * @param {string} text
 * @param {number} width
 */
export function hardWrapText(text, width) {
  let lines = text.split("\n");

  for (let line of lines) {
    line = line.slice(0, width);
  }

  return lines;
}

/**
 * @param {number} width The width of the parent container
 * @param {number} height The height of the parent container
 * @param {number} basis The default size of flexible children
 * @param {Ursine.FlexDirection} direction The direction for children to flow
 * @param {Ursine.FlexAlign} align Cross axis alignment
 * @param {Ursine.FlexJustify} justify Main axis alignment
 * @param {Ursine.FlexItem[]} children
 */
export function flex(width, height, basis, direction, align, justify, children) {
  let row = direction === "row";

  let $x = row ? "x" : "y";
  let $y = row ? "y" : "x";

  let $width = row ? "width" : "height";
  let $height = row ? "height" : "width";

  [width, height] = row ? [width, height] : [height, width];

  for (let child of children) {
    if (child[$height] == null) {
      child[$height] = height;
    }

    switch (align) {
      case "start":
        child[$y] = 0;
        break;
      case "end":
        child[$y] = height - child[$height];
        break;
      case "center":
        child[$y] = Math.floor((height / 2) - (child[$height] / 2));
        break;
      case "stretch":
        child[$y] = 0;
        child[$height] = height;
        break;
    }
  }

  let availableWidth = width;
  let flexibleChildren = 0;

  for (let child of children) {
    if (child[$width] == null) {
      flexibleChildren += 1;

      if (justify !== "stretch") {
        child[$width] = basis;
      }
    }

    if (child[$width] != null) {
      availableWidth -= child[$width];
    }
  }

  switch (justify) {
    case "start": {
      let x = 0;

      for (let child of children) {
        child[$x] = x;
        x += child[$width];
      }

      break;
    }

    case "end": {
      let x = width;

      for (let i = children.length - 1; i >= 0; i--) {
        let child = children[i];
        x -= child[$width];
        child[$x] = x;
      }

      break;
    }

    case "center": {
      let x = Math.floor(availableWidth / 2);

      for (let child of children) {
        child[$x] = x;
        x += child[$width];
      }

      break;
    }

    case "stretch": {
      let flexWidth = Math.floor(availableWidth / flexibleChildren);
      let x = 0;

      for (let child of children) {
        child[$x] = x;

        if (child[$width] == null) {
          child[$width] = flexWidth;
        }

        x += child[$width];
      }

      break;
    }

    case "space-around": {
      let spacing = availableWidth / (children.length + 1);
      let padding = Math.round(spacing);
      let x = padding;

      for (let child of children) {
        child[$x] = x;
        x += padding + child[$width];
      }

      break;
    }

    case "space-between": {
      let spacing = availableWidth / (children.length - 1);
      let padding = Math.round(spacing);
      let delta = spacing - padding;
      let error = 0;
      let x = 0;

      for (let child of children) {
        error += delta;

        if (Math.abs(error) >= 1) {
          x += Math.sign(delta);
          error = error - Math.sign(delta);
        }

        child[$x] = x;
        x += child[$width] + padding;
      }

      break;
    }
  }

  return children;
}

/**
 * @param {Ursine.Rectangle} parent
 * @param {Ursine.Rectangle} child
 * @param {Ursine.FlexAlign} justify
 * @param {Ursine.FlexAlign} align
 * @return {Ursine.Rectangle}
 */
export function getAlignedBounds(parent, child, justify, align) {
  let bounds = {
    x: child.x,
    y: child.y,
    width: child.width,
    height: child.height,
  };

  switch (align) {
    case "start":
      bounds.x = 0;
      break;
    case "end":
      bounds.x = parent.width - child.x;
      break;
    case "center":
      bounds.x = Math.floor(parent.width / 2 - child.width / 2);
      break;
    case "stretch":
      bounds.x = 0;
      bounds.width = parent.width;
      break;
  }

  switch (justify) {
    case "start":
      bounds.y = 0;
      break;
    case "end":
      bounds.y = parent.height - child.y;
      break;
    case "center":
      bounds.y = Math.floor(parent.height / 2 - child.height / 2);
      break;
    case "stretch":
      bounds.y = 0;
      bounds.height = parent.height;
      break;
  }

  return bounds;
}

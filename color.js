function RGBA(r, g, b, a) {
  return Float32Array.of(r / 255, g / 255, b / 255, a / 255);
}

let rgbaCache = new Map()
  .set(null,      RGBA(0x00, 0x00, 0x00, 0x00))
  .set(undefined, RGBA(0x00, 0x00, 0x00, 0x00))
  .set("black",   RGBA(0x00, 0x00, 0x00, 0xFF))
  .set("white",   RGBA(0xFF, 0xFF, 0xFF, 0xFF))
  .set("grey",    RGBA(0x88, 0x88, 0x88, 0xFF))
  .set("red",     RGBA(0xFF, 0x00, 0x00, 0xFF))
  .set("green",   RGBA(0x00, 0x80, 0x00, 0xFF))
  .set("blue",    RGBA(0x00, 0x00, 0xFF, 0xFF))
  .set("orange",  RGBA(0xFF, 0xA5, 0x00, 0xFF))
  .set("yellow",  RGBA(0xFF, 0xFF, 0x00, 0xFF))

export function rgbaFromString(str) {
  let color = rgbaCache.get(str);

  if (color != null) {
    return color;
  }

  if (typeof str === "number") {
    let r = str >> 0xF0;
    let g = str >> 0x08 & 0xFF;
    let b = str & 0xFF;
    let a = 0xFF;
    color = RGBA(r, g, b, a)
  }

  else if (str[0] === "#" && str.length === 9) {
    let r = parseInt(str.slice(1, 3), 16);
    let g = parseInt(str.slice(3, 5), 16);
    let b = parseInt(str.slice(5, 7), 16);
    let a = parseInt(str.slice(7, 9), 16);
    color = RGBA(r, g, b, a)
  }

  else if (str[0] === "#" && str.length === 7) {
    let r = parseInt(str.slice(1, 3), 16);
    let g = parseInt(str.slice(3, 5), 16);
    let b = parseInt(str.slice(5, 7), 16);
    let a = 0xFF;
    color = RGBA(r, g, b, a)
  }

  else if (str[0] === "#" && str.length === 5) {
    let r = parseInt(str[1] + str[1], 16);
    let g = parseInt(str[2] + str[2], 16);
    let b = parseInt(str[3] + str[3], 16);
    let a = parseInt(str[4] + str[4], 16);
    color = RGBA(r, g, b, a)
  }

  else if (str[0] === "#" && str.length === 4) {
    let r = parseInt(str[1] + str[1], 16);
    let g = parseInt(str[2] + str[2], 16);
    let b = parseInt(str[3] + str[3], 16);
    let a = 0xFF;
    color = RGBA(r, g, b, a)
  }

  else {
    throw new Error(`Invalid color format: ${str}`);
  }

  rgbaCache.set(str, color);

  return color;
}

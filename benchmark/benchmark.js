import { Font } from "../index.js";
import { CanvasTerminal } from "../canvas.js";
import { WebGlTerminal } from "../webgl.js";

let $ = selector => document.querySelector(selector);

/**
 * @type {CanvasTerminal}
 */
let term;

/**
 * @type {CanvasTerminal}
 */
let canvasTerm;

/**
 * @type {CanvasTerminal}
 */
let webglTerm;

let palette = [
  "red",
  "black",
  "white",
  "yellow",
  "orange",
  "green",
  "blue",
  "grey"
]

let paused = false;

function loop() {
  requestAnimationFrame(loop);

  if (paused) return;

  for (let x = 0; x < term.width; x++) {
    for (let y = 0; y < term.height; y++) {
      let size = term.font.columns * term.font.rows;
      let char = Math.floor(Math.random() * size);
      let fg = palette[Math.floor(Math.random() * palette.length)];
      let bg = palette[Math.floor(Math.random() * palette.length)];
      term.put(x, y, char, fg, bg);
    }
  }

  term.refresh();
}

$("#canvas").addEventListener("change", () => {
  term = canvasTerm;
});

$("#webgl").addEventListener("change", () => {
  term = webglTerm;
});

$("#pause").addEventListener("click", () => {
  paused = !paused;
});

async function start() {
  let font = await Font.load("../example/font.png");
  let settings = { font };
  canvasTerm = new CanvasTerminal(settings);
  webglTerm = new WebGlTerminal(settings);
  term = canvasTerm;

  document.querySelector("#canvas-root").appendChild(canvasTerm.canvas);
  document.querySelector("#webgl-root").appendChild(webglTerm.canvas);
  loop();
}

start();

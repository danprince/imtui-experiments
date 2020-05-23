import { VirtualTerminal } from "./terminal.js";
import { rgbaFromString } from "./color.js";
import * as mat4 from "./mat4.js";

const UNIT_QUAD = [
  0, 0,
  0, 1,
  1, 0,
  1, 0,
  0, 1,
  1, 1,
];

const VERTEX_SHADER = `
  attribute vec4 a_position;
  attribute vec2 a_texcoord;

  uniform mat4 u_matrix;
  uniform mat4 u_texmatrix;

  varying vec2 v_texcoord;

  void main() {
    gl_Position = u_matrix * a_position;
    v_texcoord = a_texcoord;
    v_texcoord = (u_texmatrix * vec4(a_texcoord, 0, 1)).xy;
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;

  varying vec2 v_texcoord;

  uniform sampler2D u_texture;
  uniform vec4 u_fgcolor;
  uniform vec4 u_bgcolor;

  void main() {
    vec4 color = texture2D(u_texture, v_texcoord);

    if (color.a == 0.0) {
      gl_FragColor = u_bgcolor;
    } else {
      float lightness = color.r;
      gl_FragColor = vec4(u_fgcolor.rgb * lightness, color.a);
    }
  }
`;

export class WebGlTerminal extends VirtualTerminal {
  constructor(settings) {
    super(settings);

    let canvas = document.createElement("canvas");

    canvas.classList.add("webgl");

    let gl = canvas.getContext("webgl", {
      // Prevent the canvas from being cleared after each call
      preserveDrawingBuffer: true,
    });

    let program = gl.createProgram();

    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, VERTEX_SHADER);
    gl.shaderSource(fragmentShader, FRAGMENT_SHADER);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      let message = gl.getShaderInfoLog(vertexShader);
      gl.deleteShader(vertexShader);
      throw new Error(message);
    }

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      let message = gl.getShaderInfoLog(fragmentShader);
      gl.deleteShader(fragmentShader);
      throw new Error(message);
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      throw new Error(gl.getProgramInfoLog(program));
    }

    let texture = gl.createTexture();
    let image = this.font.image;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    this.canvas = canvas;

    this.gl = gl;

    this.program = program;

    this.texture = texture;

    this.glbuffers = {
      position: gl.createBuffer(),
      texcoord: gl.createBuffer(),
    };

    this.attributes = {
      position: gl.getAttribLocation(this.program, "a_position"),
      texcoord: gl.getAttribLocation(this.program, "a_texcoord"),
    };

    this.uniforms = {
      matrix: gl.getUniformLocation(this.program, "u_matrix"),
      texture: gl.getUniformLocation(this.program, "u_texture"),
      texmatrix: gl.getUniformLocation(this.program, "u_texmatrix"),
      fgcolor: gl.getUniformLocation(this.program, "u_fgcolor"),
      bgcolor: gl.getUniformLocation(this.program, "u_bgcolor"),
    };

    gl.useProgram(program);

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.glbuffers.position);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(UNIT_QUAD), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.glbuffers.texcoord);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(UNIT_QUAD), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.glbuffers.position);
    gl.enableVertexAttribArray(this.attributes.position);
    gl.vertexAttribPointer(this.attributes.position, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.glbuffers.texcoord);
    gl.enableVertexAttribArray(this.attributes.texcoord);
    gl.vertexAttribPointer(this.attributes.texcoord, 2, gl.FLOAT, false, 0, 0);

    this.reset();
  }

  reset() {
    super.reset();
    this.canvas.width = this.width * this.font.glyphWidth * this.scale;
    this.canvas.height = this.height * this.font.glyphHeight * this.scale;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.style.imageRendering = "pixelated";
  }

  /**
   * Share transform matrix across draw calls
   *
   * @private
   */
  matrix = mat4.create();

  /**
   * Share texture matrix across draw calls
   *
   * @private
   */
  texmatrix = mat4.create();

  /**
   * @param {number} sx
   * @param {number} sy
   * @param {number} sw
   * @param {number} sh
   * @param {number} dx
   * @param {number} dy
   * @param {number} dw
   * @param {number} dh
   * @param {number} fg
   * @param {number} bg
   */
  draw(sx, sy, sw, sh, dx, dy, dw, dh, fg, bg) {
    let gl = this.gl;

    mat4.ortho(this.matrix, 0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
    mat4.translate(this.matrix, this.matrix, dx, dy, 0);
    mat4.scale(this.matrix, this.matrix, dw, dh, 1);

    let texWidth = this.font.image.width;
    let texHeight = this.font.image.height;
    mat4.translation(this.texmatrix, sx / texWidth, sy / texHeight, 0);
    mat4.scale(this.texmatrix, this.texmatrix, sw / texWidth, sh / texHeight, 1);

    gl.uniformMatrix4fv(this.uniforms.matrix, false, this.matrix);
    gl.uniformMatrix4fv(this.uniforms.texmatrix, false, this.texmatrix);
    gl.uniform4fv(this.uniforms.fgcolor, rgbaFromString(fg));
    gl.uniform4fv(this.uniforms.bgcolor, rgbaFromString(bg));
    gl.uniform1i(this.uniforms.texture, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  screenToGrid(x, y) {
    let { left, top } = this.canvas.getBoundingClientRect();
    return this.canvasToGrid(x - left, y - top);
  }
}

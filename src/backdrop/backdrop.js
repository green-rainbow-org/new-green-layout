import globalCSS from 'global-css' assert { type: 'css' };
import { toTag, CustomTag } from 'tag';
import { shaders } from 'shaders';

const toBackdrop = (data) => {
  class Backdrop extends CustomTag {

    static get setup() {
      return {
        time: Date.now(),
        height: window.innerHeight,
        width: window.innerWidth
      };
    }

    get root() {
      return toTag('canvas')``();
    }

    draw() {
      if (this.gl === undefined) return;
      const canvas = this.shadowRoot.children[0];
      window.setTimeout(() => {
        updateUniforms(this.gl, this.uniforms, this.data);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.draw();
      }, 40);
    }

    connected() {
      const canvas = this.shadowRoot.children[0];
      const { gl, uniforms } = toWebGL(canvas);
      this.uniforms = uniforms;
      this.gl = gl;
      this.draw();
    }

    changed(key, _, val) {
      const shape_keys = new Set(['width', 'height']);
      const canvas = this.shadowRoot.children[0];
      if (shape_keys.has(key)) canvas[key] = val;
      toViewport(this.gl, canvas);
    }
  }
  return toTag('backdrop', Backdrop)``({
    data,
    width: d => d.width,
    height: d => d.height,
    class: 'full-grid backdrop content'
  });
}

const validate = (stat, param, log, sh, value) => {
  if (param(value, stat)) return;
  console.log(sh+':\n'+log(value));
}

const toProgram = (gl, shaders) => {
  const program = gl.createProgram();
  Object.entries(shaders).map(([sh, given]) => {
      const shader = gl.createShader(gl[sh]);
      gl.shaderSource(shader, given);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
      const stat = gl.COMPILE_STATUS;
      const log = gl.getShaderInfoLog.bind(gl);
      const param = gl.getShaderParameter.bind(gl);
      validate(stat, param, log, sh, shader);
  });
  gl.linkProgram(program);
  const stat = gl.LINK_STATUS;
  const log = gl.getProgramInfoLog.bind(gl);
  const param = gl.getProgramParameter.bind(gl);
  validate(stat, param, log, 'LINK', program);
  return program;
}

const toVertices = () => {
  const one_point_size = 2 * Float32Array.BYTES_PER_ELEMENT;
  const points_list_size = 4 * one_point_size;
  return {
    one_point_size, points_list_size,
    points_buffer: new Float32Array([
      0, 0, 0, 1, 1, 0, 1, 1
    ])
  };
}

const updateUniforms = (gl, uniforms, data) => {
  const dt = (Date.now() - data.time);
  const { u_shape, u_time } = uniforms;
  gl.uniform2i(u_shape, data.width, data.height);
  gl.uniform1f(u_time, dt);
}

const toUniforms = (program, gl) => {
  const u_shape = gl.getUniformLocation(program, "u_shape");
  const u_time = gl.getUniformLocation(program, "u_time");
  return { u_shape, u_time };
}

const toBuffers = (gl, program, buffer, verts) => {

  const a_uv = gl.getAttribLocation(program, 'a_uv');

  // Assign vertex inputs
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, verts.points_buffer, gl.STATIC_DRAW);

  // Enable vertex buffer
  gl.enableVertexAttribArray(a_uv);
  gl.vertexAttribPointer(
    a_uv, 2, gl.FLOAT, 0,
    verts.one_point_size,
    0 * verts.points_list_size
  );
}

const toViewport = (gl, canvas) => {
  gl?.viewport(0, 0, canvas.width, canvas.height);
}

const toWebGL = canvas => {
  const gl = canvas.getContext('webgl2');
  const program = toProgram(gl, shaders);
  toViewport(gl, canvas);
  gl.useProgram(program);
  const uniforms = toUniforms(program, gl);
  const buffer = gl.createBuffer();
  const verts = toVertices();
  toBuffers(gl, program, buffer, verts);
  return { gl, uniforms };
}

export { toBackdrop };

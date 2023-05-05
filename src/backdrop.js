import { toTag, CustomTag } from 'tag';

const LAB_CONVERSIONS = `
float f_xz(float f) {
  float epsilon = 0.008856;
  if (pow(f, 3.) > epsilon) {
    return pow(f, 3.);
  }
  float kappa = 903.3;
  return  (116.*f - 16.) / kappa;
}

float f_y(float L, float fy) {
  float epsilon = 0.008856;
  float kappa = 903.3;
  if (L > kappa * epsilon) {
    return pow(fy, 3.);
  }
  return L / kappa;
}

vec3 lab2xyz( vec3 c ) {
  float L = c.x;
  float a = c.y;
  float b = c.z;
  float fy = (L + 16.) / 116.;
  float Z = f_xz(fy - b / 200.0);
  float X = f_xz(a / 500.0 + fy);
  vec3 white = vec3(85., 110., 110.);
  return white * vec3(X, f_y(L, fy), Z);
}

float compand(float f) {
  if (f > 0.0031308) {
    float gamma = 1./2.2;
    return 1.055 * pow(f, gamma) - 0.055;
  }
  return 12.92 * f;
}

vec3 xyz2rgb( vec3 c ) {
	mat3 mat = mat3(
    3.2406, -1.5372, -0.4986,
    -0.9689, 1.8758, 0.0415,
    0.0557, -0.2040, 1.0570
	);
  vec3 v = mat * (c / 100.0);
  return vec3(compand(v.r), compand(v.g), compand(v.b));
}
`

const VERTEX_SHADER = `#version 300 es
precision highp int;
precision highp float;
in vec2 a_uv;
out vec2 uv;

void main() {
// Texture coordinates
uv = a_uv;

// Clip coordinates
vec2 full_pos = vec2(1., -1.) * (2. * a_uv - 1.);
gl_Position = vec4(full_pos, 0., 1.);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp int;
precision highp float;
uniform float u_time;
uniform ivec2 u_shape;
in vec2 uv;
out vec4 color;

${LAB_CONVERSIONS}

vec3 lab2rgb(float L, float a, float b) {
  vec3 rgb = xyz2rgb(
    lab2xyz(
      vec3(
        100.0 * L,
        255. * a,
        255. * b 
      ) 
    )
  );
  return vec3(
    clamp(rgb.r, 0., 1.),
    clamp(rgb.g, 0., 1.),
    clamp(rgb.b, 0., 1.)
  );
}

float linear(vec2 ran, float x) {
  float m = ran[1] - ran[0];
  return m * x + ran[0];
}

vec3 lch2rgb(float L, float C, float hue) {
  return lab2rgb(L, C*cos(hue), C*sin(hue));
}

vec3 lch(float l, float c, float h) {
  float L = linear(vec2(.6, .9), l);
  float C = linear(vec2(.2, .5), c);
  float hue = linear(vec2(2.5, 3.0), h);
  return lch2rgb(L, C, hue);
}

vec2 normalized(ivec2 shape) {
  float norm = float(max(shape.x, shape.y));
  vec2 max = 0.5 * vec2(shape) / norm;
  float x = linear(vec2(0.5 - max.x, 0.5 + max.x), uv.x);
  float y = linear(vec2(0.5 - max.y, 0.5 + max.y), uv.y);
  return vec2(x, y);
}

vec3 wave(vec2 c, float dt) {
  float amp = 0.2;
  float phase = 3.14;
  float k = 2. * 3.14;
  float speed = 0.001;
  float w = (
    amp * sin(k*c.x + speed*dt)
    +
    0.25 * amp * sin(3.*k*c.x + speed*dt + phase)
  );
  vec3 result = lch(1. - w - c.y, 0.1, 0.25);
  return result;
}

void main() {
  vec2 c = normalized(u_shape);
  color = vec4(wave(c, u_time), 1.0);
}
`

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
  const shaders = {
    VERTEX_SHADER, FRAGMENT_SHADER
  };
  const program = toProgram(gl, shaders);
  toViewport(gl, canvas);
  gl.useProgram(program);
  const uniforms = toUniforms(program, gl);
  const buffer = gl.createBuffer();
  const verts = toVertices();
  toBuffers(gl, program, buffer, verts);
  return { gl, uniforms };
}


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

  get styles() {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`{
      background-color: blue;
    }`);
    return [sheet];
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

export { Backdrop };

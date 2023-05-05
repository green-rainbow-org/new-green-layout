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

vec3 lch_green(float l, float c, float h) {
  float L = linear(vec2(.3, .7), l);
  float C = linear(vec2(.25, .4), c);
  float hue = linear(vec2(2.5, 3.0), h);
  return lch2rgb(L, C, hue);
}

vec3 lch_rainbow(float l, float c, float h) {
  float L = linear(vec2(.7, .9), l);
  float C = linear(vec2(.25, .4), c);
  float hue = linear(vec2(3.2, 5.3), h);
  return lch2rgb(L, C, mod(hue, 6.28));
}

vec2 max_rectilinear(ivec2 shape) {
  float norm = float(max(shape.x, shape.y));
  return 0.5 * vec2(shape) / norm;
}

vec2 center_rectilinear(ivec2 shape, vec2 p) {
  vec2 max = max_rectilinear(shape);
  float x = linear(vec2(0.5 - max.x, 0.5 + max.x), p.x);
  float y = linear(vec2(0.5 - max.y, 0.5 + max.y), p.y);
  return vec2(x, y);
}

float leaf_top(float x) {
  return ((3. - 3.*x) * sin(2. - 2.*x) + 1.)/4.;
}

float leaf_bottom(float x) {
  return ((3.*x - 3.) * cos(2. - 2.*x) + 4.5*x - 3.5)/4.;
}

vec2 translate(vec2 p, float dx, float dy) {
  mat3 trans = mat3(
    1.0, 0.0, dx,
    0.0, 1.0, dy,
    0.0, 0.0, 1.0
  );
  vec3 p3 = vec3(p.x, p.y, 1.0);
  return (p3 * trans).xy;
}

vec3 wave(vec2 c, float dt) {
  float amp = 0.15;
  float phase = 3.14;
  float k = 1. * 3.14;
  float speed = 0.002;
  vec2 scale = 0.75*vec2(1., 0.5);
  float wv = (
    amp * sin(k*uv.x + speed*dt)
  );
  float added_white = 1. - 4.*pow(uv.y - .25, 2.);
  vec3 basic_background = vec3(220, 220, 220)/255.;
  // Reference the corners
  vec2 max = max_rectilinear(u_shape);
  // Move and draw the leaf
  float dx = -0.6*max.x/2.;
  float dy = -1.2*max.y/2.;
  vec2 o = translate(c, dx, dy);
  float ox = linear(vec2(-1./scale.x, 1./scale.x), o.x);
  float oy = linear(vec2(1./scale.y, -1./scale.y), o.y);
  float top = leaf_top(ox);
  float bottom = leaf_bottom(ox);
  if (top - oy > 0.05 && oy - bottom > 0.05) {
    vec3 green = lch_green(wv + uv.y, 1. - wv - uv.y, 1. - wv - uv.y);
    return mix(green, basic_background, 0.1);
  }
  vec3 rain = lch_rainbow(wv + uv.y, 1. - wv - uv.y, 1. - wv - uv.y);
  return mix(rain, basic_background, added_white);
}

void main() {
  vec2 c = center_rectilinear(u_shape, uv);
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

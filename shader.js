const canvasSketch = require("canvas-sketch");
const createShader = require("canvas-sketch-util/shader");
const glsl = require("glslify");

// Setup our sketch
const settings = {
  context: "webgl",
  animate: true
};

// Your glsl code
const frag = glsl(/* glsl */ `
  precision highp float;

  uniform float time;
  uniform float aspect;
  varying vec2 vUv;

  #pragma glslify: noise = require('glsl-noise/simplex/3d')
  #pragma glslify: hsl2rgb = require('glsl-hsl2rgb');

  void main () {

    vec2 center = vUv - 0.5;
    center.x *= aspect;

    float dist = length(center) * 0.6;
    float alpha = smoothstep(0.251 , 0.25, dist);

    float n = noise(vec3(center, time* 0.06));

    vec3 color = hsl2rgb(
      0.4 + n * 0.3,
      0.5,
      0.5
    );
    gl_FragColor = vec4(color, alpha);

  }
`);

// Your sketch, which simply returns the shader
const sketch = ({ gl }) => {
  // Create the shader and return it
  return createShader({
    clearColor: "white",
    // Pass along WebGL context
    gl,
    // Specify fragment and/or vertex shader strings
    frag,
    // Specify additional uniforms to pass down to the shaders
    uniforms: {
      // Expose props from canvas-sketch
      time: ({ time }) => time,
      aspect: ({ width, height }) => width / height
    }
  });
};

canvasSketch(sketch, settings);

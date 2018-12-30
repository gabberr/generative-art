const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");
const eases = require("eases");
const glslify = require("glslify");
// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const settings = {
  // Make the loop animated
  animate: true,
  duration: 4,
  // Get a WebGL canvas rather than 2D
  context: "webgl",
  // Turn on MSAA
  attributes: { antialias: true }
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    context
  });

  // WebGL background color
  renderer.setClearColor("hsl(0, 0%, 95%)", 1.0);

  // Setup a camera
  const camera = new THREE.OrthographicCamera();

  // Setup your scene
  const scene = new THREE.Scene();
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  const palette = random.pick(palettes);

  const fragmentShader = /* glsl */ `
  
  
  varying vec2 vUv;
  uniform vec3 color;


  void main () {
      gl_FragColor = vec4( vec3(color * vUv.x), 1.0);
  }
  `;

  const vertexShader = glslify(/* glsl */ `
  varying vec2 vUv;

  uniform float time;

  #pragma glslify: noise = require('glsl-noise/simplex/4d');

    void main() {
        vUv = uv;
        vec3 pos = position.xyz;
        pos += normal * noise(vec4(position.xyz, time));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `);

  const meshes = [];
  for (let i = 0; i < 40; i++) {
    const mesh = new THREE.Mesh(
      boxGeo,
      new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color(random.pick(palette)) }
        }
      })
    );
    mesh.position.set(
      random.range(-1, 1),
      random.range(-1, 1),
      random.range(-1, 1)
    );
    mesh.scale.set(
      random.range(-1, 1),
      random.range(-1, 1),
      random.range(-1, 1)
    );
    mesh.scale.multiplyScalar(0.4);
    scene.add(mesh);
    meshes.push(mesh);
  }

  scene.add(new THREE.AmbientLight());
  const light = new THREE.DirectionalLight("hsl(0,0%,25%)", 1);
  light.position.set(0, 0, 10);
  scene.add(light);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);

      const aspect = viewportWidth / viewportHeight;

      // Ortho zoom
      const zoom = 2.0;

      // Bounds
      camera.left = -zoom * aspect;
      camera.right = zoom * aspect;
      camera.top = zoom;
      camera.bottom = -zoom;

      // Near/Far
      camera.near = -100;
      camera.far = 100;

      // Set position & look at world center
      camera.position.set(zoom, zoom, zoom);
      camera.lookAt(new THREE.Vector3());

      // Update the camera
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ playhead, time }) {
      const t = Math.sin(playhead * Math.PI);
      scene.rotation.z = eases.expoInOut(t);

      meshes.forEach(mesh => {
        mesh.material.uniforms.time.value = time;
      });

      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);

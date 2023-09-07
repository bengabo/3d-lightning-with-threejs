import * as THREE from "three";
import {
  AxesHelper,
  BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TextureLoader,
  WebGLRenderer,
  Group,
  Clock,
  MeshStandardMaterial,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as TWEEN from "tween.js";
import "./style.css";

THREE.ColorManagement.enabled = false;

const scene = new Scene();
// scene.add(new AxesHelper());

// Camera
const fov = 75;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 2000;
const camera = new PerspectiveCamera(fov, aspect, near, far);

camera.position.x = 0.25;
camera.position.y = 0;
camera.position.z = 1;
scene.add(camera);

/**
 * Textures
 **/
const cubeTextureLoader = new THREE.CubeTextureLoader();
const textureLoader = new TextureLoader();

const lightningTexture = textureLoader.load("/lightning.png");
const alphaMapLightning = textureLoader.load("/lightning_alphaMap.png");

const goldColorTexture = textureLoader.load(
  "/textures/gold/MetalGoldPaint002_COL_2K_METALNESS.png"
);
// const goldAlphaTexture = textureLoader.load('/textures/gold/alpha.png');
// const goldAmbientOcclusionTexture = textureLoader.load('/textures/gold/ambientOcclusion.png');
const goldHeightTexture = textureLoader.load(
  "/textures/gold/MetalGoldPaint002_DISP_2K_METALNESS.png"
);
const goldBumpTexture = textureLoader.load(
  "/textures/gold/MetalGoldPaint002_BUMP_2K_METALNESS.png"
);
const goldNormalTexture = textureLoader.load(
  "/textures/gold/MetalGoldPaint002_NRM_2K_METALNESS.png"
);
const goldMetalnessTexture = textureLoader.load(
  "/textures/gold/MetalGoldPaint002_METALNESS_2K_METALNESS.png"
);
const goldRoughnessTexture = textureLoader.load(
  "/textures/gold/MetalGoldPaint002_ROUGHNESS_2K_METALNESS.png"
);
// const matcapTexture = textureLoader.load('/textures/matcaps/8.png');
// const gradientTexture = textureLoader.load('/textures/gradients/5.png');

const environmentMapTexture = cubeTextureLoader.load([
  "/environmentMaps/0/px.jpg",
  "/environmentMaps/0/nx.jpg",
  "/environmentMaps/0/py.jpg",
  "/environmentMaps/0/ny.jpg",
  "/environmentMaps/0/pz.jpg",
  "/environmentMaps/0/nz.jpg",
]);

const material = new THREE.MeshStandardMaterial();
material.metalness = 0.7;
material.roughness = 0.2;
material.envMap = environmentMapTexture;

/**
 *  Tween animation
 **/

const animateInitialScale = (object, targetScale, duration) => {
  const initialScale = { x: 0, y: 0, z: 0 };
  const finalScale = { x: targetScale, y: targetScale, z: targetScale };

  const tween = new TWEEN.Tween(initialScale)
    .to(finalScale, duration)
    .easing(TWEEN.Easing.Quadratic.Out) // Adjust the easing function as needed
    .onUpdate(() => {
      object.scale.set(initialScale.x, initialScale.y, initialScale.z);
    })
    .start();
};

const animateInitialRotation = (object, targetRotation, duration) => {
  const initialRotation = { x: 0, y: 0, z: 0 };
  const finalRotation = {
    x: targetRotation,
    y: targetRotation,
    z: targetRotation,
  };

  const tween = new TWEEN.Tween(initialRotation)
    .to(finalRotation, duration)
    .easing(TWEEN.Easing.Quadratic.Out) // Adjust the easing function as needed
    .onUpdate(() => {
      object.rotation.set(
        initialRotation.x,
        initialRotation.y,
        initialRotation.z
      );
    })
    .start();
};

const animateScale = (object, targetScale, duration) => {
  const scale = { x: object.scale.x, y: object.scale.y, z: object.scale.z };
  const tween = new TWEEN.Tween(scale)
    .to(targetScale, duration)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      object.scale.set(scale.x, scale.y, scale.z);
    })
    .start();
};
const animateRotation = (object, targetRotation, duration) => {
  const rotation = {
    x: object.rotation.x,
    y: object.rotation.y,
    z: object.rotation.z,
  };
  const tween = new TWEEN.Tween(rotation)
    .to(targetRotation, duration)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      object.rotation.set(rotation.x, rotation.y, rotation.z);
    })
    .start();
};

/**
 * Points on space
 */
const count = 500;
const distance = 2;
const points = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);
for (let i = 0; i < points.length; i++) {
  points[i] = MathUtils.randFloatSpread(distance * 3);
  colors[i] = Math.random();
}

const geometry = new BufferGeometry();
geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
const pointsMaterial = new PointsMaterial({
  size: 0.08,
  vertexColors: true,
  map: lightningTexture,
  alphaTest: 0.01,
  alphaMap: alphaMapLightning,
  transparent: true,
});

const pointsObject = new Points(geometry, pointsMaterial);
const lightningsGroup = new Group();
lightningsGroup.add(pointsObject);

pointsObject.scale.set(0, 0, 0);
animateInitialScale(pointsObject, 1, 2000);
scene.add(lightningsGroup);
lightningsGroup.rotation.set(0, 0, 0);
animateInitialRotation(lightningsGroup, 1, 2000);

/**
 * 3D imported object
 **/
const lightningGoldMaterial = new MeshStandardMaterial({
  map: goldColorTexture,
  bumpMap: goldBumpTexture,
  roughness: 0.8,
  metalness: 0.9,
  normalMap: goldNormalTexture,
  roughnessMap: goldRoughnessTexture,
  metalnessMap: goldMetalnessTexture,
  // envMap: envMap,
  // envMapIntensity: envMapIntensity
});

const loader = new GLTFLoader();
let lightningObject;
loader.load("/Lightning3D.gltf", (gltfScene) => {
  lightningObject = gltfScene.scene;
  lightningObject.traverse((child) => {
    if (child.isMesh) {
      child.material = lightningGoldMaterial;
    }
  });

  lightningObject.scale.set(0, 0, 0);
  scene.add(lightningObject);
  animateInitialScale(lightningObject, 1, 1500);
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let isMouseOverObject = false;
document.addEventListener("mousemove", (event) => {
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster's origin and direction based on the mouse position
  raycaster.setFromCamera(mouse, camera);

  // Check for intersections with the lightningObject
  const intersects = raycaster.intersectObject(lightningObject, true);

  if (intersects.length > 0) {
    if (!isMouseOverObject) {
      isMouseOverObject = true; // Mouse over the 3D object
      onMouseOver();
    }
  } else {
    if (isMouseOverObject) {
      isMouseOverObject = false; // Mouse out of the 3D object
      onMouseOut();
    }
  }
});

function onMouseOver() {
  if (lightningObject) {
    animateScale(lightningObject, { x: 1.5, y: 1.5, z: 1.5 }, 400);
    animateRotation(lightningObject, { x: 0.15, y: 0.3, z: 0.05 }, 400);
  }
}

// Restore original size and position
function onMouseOut() {
  if (lightningObject) {
    animateScale(lightningObject, { x: 1, y: 1, z: 1 }, 400);
    animateRotation(lightningObject, { x: 0, y: 0, z: 0 }, 400);
  }
}

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
scene.add(ambientLight);

const directLight01 = new THREE.DirectionalLight(0xffffff, 0.2);
directLight01.position.x = 2;
directLight01.position.y = 4;
directLight01.position.z = 15;
const directLight02 = new THREE.DirectionalLight(0xffffff, 0.2);
directLight02.position.x = -8;
directLight02.position.y = -2;
directLight02.position.z = 15;
const directLight03 = new THREE.DirectionalLight(0xffffff, 0.2);
directLight03.position.x = 15;
directLight03.position.y = -10;
directLight03.position.z = 15;

const lightsAndLightningGroup = new Group();
lightsAndLightningGroup.add(
  directLight01,
  directLight02,
  directLight03,
  lightningObject
);
scene.add(lightsAndLightningGroup);

// Renderer
const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setClearAlpha(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 0.5;
controls.maxDistance = 3.5;
controls.minPolarAngle = Math.PI / 4;
controls.maxPolarAngle = Math.PI / 1.5;
controls.minAzimuthAngle = Math.PI / -5;
controls.maxAzimuthAngle = Math.PI / 5;

const clock = new Clock();

const tick = () => {
  const time = clock.getElapsedTime();
  lightningsGroup.rotation.y = time * 0.01;
  renderer.render(scene, camera);
  controls.update();
  requestAnimationFrame(tick);
  TWEEN.update();
};

tick();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

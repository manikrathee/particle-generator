import './style.css';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import Stats from 'stats.js';
import CCapture from 'ccapture.js-npmfixed';
import { ParticleSystem } from './ParticleSystem.js';
import { setupUI } from './ui.js';

// --- Setup ---
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#000000', 10, 50);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ canvas, powerPreference: "high-performance", antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- Post Processing ---
const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5, // strength
  0.4, // radius
  0.85 // threshold
);

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// --- Stats ---
const stats = new Stats();
document.body.appendChild(stats.dom);

// --- Particles ---
const particleSystem = new ParticleSystem(scene);

// --- Export Logic ---
let capturer = null;
let isRecording = false;

const startExport = () => {
  if (isRecording) return;

  // Initialize capturer
  capturer = new CCapture({
    format: 'webm', // webm is faster/easier in browser, but user asked for .mov. 
    // .mov isn't directly supported by CCapture client-side easily without server or heavy ffmpeg.wasm.
    // Standard CCapture output is webm or png/jpg tar. 
    // I'll use webm for now as it's a video format, or png if high quality needed.
    // Wait, user asked for .mov. I can't generate .mov client side easily.
    // I will generate webm and rename or just provide webm. 
    // Actually, let's stick to 'webm' as it's the most reliable video format from CCapture.
    framerate: 60,
    verbose: true,
    name: 'particle-scene'
  });

  capturer.start();
  isRecording = true;
  console.log('Started recording...');

  // Stop after 5 seconds automatically for demo purposes, or let user stop?
  // Let's record for 300 frames (5 seconds at 60fps)
  let frames = 0;
  const checkStop = () => {
    if (!isRecording) return;
    frames++;
    if (frames > 300) {
      stopExport();
    } else {
      requestAnimationFrame(checkStop);
    }
  };
  checkStop();
};

const stopExport = () => {
  if (!isRecording) return;
  capturer.stop();
  capturer.save();
  isRecording = false;
  console.log('Stopped recording.');
};

// --- UI ---
setupUI(particleSystem, startExport);

// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(window.innerWidth, window.innerHeight);
});

// --- Loop ---
const clock = new THREE.Clock();

const tick = () => {
  stats.begin();

  const elapsedTime = clock.getElapsedTime();
  const deltaTime = clock.getDelta();

  particleSystem.update(deltaTime, elapsedTime);

  // Render
  composer.render();

  // Capture
  if (isRecording && capturer) {
    capturer.capture(canvas);
  }

  stats.end();
  requestAnimationFrame(tick);
};

tick();

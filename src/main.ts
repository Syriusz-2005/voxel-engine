import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import World from './classes/World.ts';
import FlatWorldGenerator from './generator/FlatWorldGenerator.ts';
import Stats from 'three/addons/libs/stats.module.js';
import WorldManager from './classes/WorldManager.ts';
import RandomFlatWorldGenerator from './generator/RandomFlatWorldGenerator.ts';
import WorkerPool from './utils/WorkerPool.ts';
const stats = new Stats();
document.body.appendChild( stats.dom );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );

camera.position.z = 8;
camera.position.y = 50;
controls.update();

const light = new THREE.DirectionalLight(0xffffff, 0.006);
light.position.set(0.15, 0.7, 0);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.001);
scene.add(ambient);



console.time('Init');

const worldManager = new WorldManager(16, 64, scene, {
	worldGenerator: new RandomFlatWorldGenerator(),
	renderDistance: 6,
});

console.timeEnd('Init');

function animate() {
	requestAnimationFrame( animate );
	controls.update();
	stats.update();
	renderer.render( scene, camera );
	worldManager.updateVisibilityPoint(camera.position);
	worldManager.updateWorld();
	// camera.position.z += 10;
}
animate();


const pool = new WorkerPool(new URL('./workers/test.ts', import.meta.url), 4);

pool.scheduleTask({command: 'say', data: 'Hello from main thread!'})
	.then(() => {
		console.log('Task done!')
	})

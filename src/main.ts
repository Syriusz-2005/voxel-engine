import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import WorldManager from './classes/WorldManager.ts';
import RandomFlatWorldGenerator from './generator/RandomFlatWorldGenerator.ts';

const stats = new Stats();
document.body.appendChild( stats.dom );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );

camera.position.z = 8;
camera.position.y = 240;
camera.rotation.x = -0.3;
controls.update();

const light = new THREE.DirectionalLight(0xffffff, 0.006);
light.position.set(0.15, 0.7, 0);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.001);
scene.add(ambient);



console.time('Init');

const worldManager = new WorldManager(16, 64, scene, {
	worldGenerator: new RandomFlatWorldGenerator(),
	renderDistance: 10,
});

console.timeEnd('Init');

async function animate() {
	requestAnimationFrame( animate );
	// controls.update();

	stats.update();
	renderer.render( scene, camera );
	worldManager.updateVisibilityPoint(camera.position);
	await worldManager.updateWorld();
	// camera.position.z -= 3;
	
}
animate();


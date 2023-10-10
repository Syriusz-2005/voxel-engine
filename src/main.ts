import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import World from './classes/World.ts';
import FlatWorldGenerator from './generator/FlatWorldGenerator.ts';
import Stats from 'three/addons/libs/stats.module.js';
const stats = new Stats();
document.body.appendChild( stats.dom );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );

camera.position.z = 8;
camera.position.y = 8;
controls.update();

const light = new THREE.DirectionalLight(0xffffff, 0.006);
light.position.set(0.15, 0.7, 0);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.001);
scene.add(ambient);

function animate() {
	requestAnimationFrame( animate );
	controls.update();
	stats.update();
	renderer.render( scene, camera );
}
animate();

console.time('Init');
const world = new World(16, 64, scene);
console.timeEnd('Init');


console.time('generate');
const chunks = 10;
for (let x = 0; x <= chunks; x++) {
	for (let z = 0; z <= chunks; z++) {
		world.generateChunkAt(new THREE.Vector3(x, 0, z), new FlatWorldGenerator());
	}
}
console.timeEnd('generate');

console.time('Render');
world.renderAll();
console.timeEnd('Render');

console.log(world);
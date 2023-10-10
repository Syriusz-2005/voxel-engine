import Chunk from './classes/Chunk.ts';
import ChunkRenderer from './classes/ChunkRenderer.ts';
import Voxel from './classes/Voxel.ts';
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import World from './classes/World.ts';
import FlatWorldGenerator from './generator/FlatWorldGenerator.ts';


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
	renderer.render( scene, camera );
}
animate();


const world = new World(4, 64, scene);

world.generateChunkAt(new THREE.Vector3(0, 0, 0), new FlatWorldGenerator());

world.renderAll();

console.log(world);
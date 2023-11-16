import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import WorldManager from './classes/WorldManager.ts';
import RandomFlatWorldGenerator from './generator/RandomFlatWorldGenerator.ts';
import Config, { ConfigSettings } from './classes/Config.ts';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import Timer from './utils/Timer.ts';

const config = new Config();


const stats = new Stats();
document.body.appendChild( stats.dom );

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );


camera.position.z = 8;
camera.position.y = 100;
camera.rotation.x = -0.3;

let controls: OrbitControls | PointerLockControls | undefined;
let wKeyPressed = false;



function updateControls(type: ConfigSettings['CONTROLS']) {
	controls?.dispose();
	switch (type) {
		case 'orbit':
			controls = new OrbitControls(camera, renderer.domElement);
			break;

		case 'pointer-lock':
			controls = new PointerLockControls(camera, document.body);
			scene.add(controls.getObject());
			controls.lock();
			break;
	}
}
updateControls(config.CONTROLS.getValue());

config.CONTROLS.onChange(updateControls);

function onKeyDown(event: any) {
	if (event.key === 'w') {
		wKeyPressed = true;
	}
}

document.addEventListener('keydown', onKeyDown);	

document.addEventListener('keyup', (event) => {
	if (event.key === 'w') {
		wKeyPressed = false;
	}
});

document.body.appendChild( renderer.domElement );


const light = new THREE.DirectionalLight(0xffffff, 0.006);
light.position.set(0.15, 0.7, 0);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.001);
scene.add(ambient);

const axis = new THREE.AxesHelper(50);

scene.add(axis);

console.time('Init');


let worldManager = new WorldManager(scene, {
	worldGenerator: new RandomFlatWorldGenerator(),
	renderDistance: 8,
	chunkHeight: 64,
	chunkSize: config.CHUNK_SIZE.getValue(),
});

window.addEventListener('beforeunload', () => worldManager.destroy());

config.CHUNK_SIZE.onChange((size) => {
	worldManager = worldManager.new({
		...worldManager.Config,
		chunkSize: size,	
	});
});
config.RENDER_DISTANCE.onChange((distance) => {
	worldManager = worldManager.new({
		...worldManager.Config,
		renderDistance: distance,	
	});
});


console.timeEnd('Init');

let frameIndex = 0;
let chunkUpdateRequests = 0;

const timer = new Timer(1);

function animate() {
	requestAnimationFrame( animate );
	
	if (controls instanceof PointerLockControls && wKeyPressed) {
		controls.moveForward(1);
	}
	
	stats.update();
	renderer.render( scene, camera );
	worldManager.updateVisibilityPoint(camera.position);
	worldManager.updateWorld(camera)
		.then(({visibleChunks, chunkRenderRequests, facesCount}) => {
			chunkUpdateRequests += chunkRenderRequests;
			config.visibleChunks.setValue(visibleChunks);
			config.facesCount.setValue(facesCount);
			timer.useTimer(() => {
				config.chunkUpdates.setValue(chunkUpdateRequests);
				chunkUpdateRequests = 0;
			});
		});
	// camera.position.z -= 3;
	
	frameIndex++;
}
animate();


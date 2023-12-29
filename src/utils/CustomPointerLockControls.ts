import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";



export default class CustomPointerLockControls extends PointerLockControls {
  constructor(camera: THREE.Camera, domElement?: HTMLElement) {
    super(camera, domElement);
  }

  public override async lock(): Promise<void> {
    await document.documentElement.requestFullscreen();
    // @ts-ignore
    await navigator.keyboard.lock();
    
    super.lock();
    document.onkeydown = (event) => {
      console.log('key pressed', event.key);
    }

    console.log('locked');
  }
}
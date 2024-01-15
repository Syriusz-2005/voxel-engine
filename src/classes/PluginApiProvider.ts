import CameraApi from "../api/Camera.js";
import ThreadedSceneManager from "../server/ThreadedSceneManager.js";



export default class PluginApiProvider {
  #world: ThreadedSceneManager;
  #camera: CameraApi;

  constructor(
    world: ThreadedSceneManager,
  ) {
    this.#world = world;
    this.#camera = new CameraApi(this.#world);
  }
  
  public getCamera(): CameraApi {
    return this.#camera;
  }
}
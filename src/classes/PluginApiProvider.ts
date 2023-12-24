import CameraApi from "../api/Camera";
import ThreadedWorldManager from "./ThreadedWorldManager";



export default class PluginApiProvider {
  #world: ThreadedWorldManager;
  #camera: CameraApi;

  constructor(
    world: ThreadedWorldManager,
  ) {
    this.#world = world;
    this.#camera = new CameraApi(this.#world);
  }
  
  public getCamera(): CameraApi {
    return this.#camera;
  }
}
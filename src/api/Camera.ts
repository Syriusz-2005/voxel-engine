import { Vector3 } from "three";
import ThreadedSceneManager from "../classes/ThreadedSceneManager";


export default class CameraApi {
  #manager: ThreadedSceneManager;

  constructor(manager: ThreadedSceneManager) {
    this.#manager = manager;
  }

  public getPos(): Vector3 | undefined {
    return this.#manager.VisibilityPoint?.clone();
  }

  public setPos(pos: Vector3): void {
    this.#manager.moveCamera(pos);
  }

  public addPos(pos: Vector3): void {
    const point = this.getPos() ?? new Vector3(0, 0, 0);
    this.#manager.moveCamera(point.add(pos));
  }
}
import ThreadController from "../utils/ThreadController.ts";
import { WorldManagerConfig } from "./WorldManager.ts";

export type NextFrameMessage = {
  command: 'nextFrame';
  data: {
    frameIndex: number;
    cameraPos: [number, number, number];
  }
}

export type ConfigUpdateMessage = {
  command: 'configUpdate';
  data: WorldManagerConfig;
}

export type WorldControllerMessage = NextFrameMessage | ConfigUpdateMessage;

export default class WorldController {
  private readonly worldControllerThread = new ThreadController<WorldControllerMessage>(
    new URL('../workers/WorldControllerThread.ts', import.meta.url)
  );

  public async postNextFrame(msg: NextFrameMessage) {
    await this.worldControllerThread.fetch(msg);
  }

  public async postUpdateConfig(msg: ConfigUpdateMessage) {
    await this.worldControllerThread.fetch(msg);
  }
}
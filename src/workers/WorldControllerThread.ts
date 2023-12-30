import { Vector3 } from "three";
import ThreadedSceneManager from "../classes/ThreadedSceneManager.ts";
import { WorldControllerMessage } from "../classes/WorldController.ts";
import ThreadReceiver from "../utils/ThreadReceiver.ts";
import RandomFlatWorldGenerator from "../generator/RandomFlatWorldGenerator.ts";


export default class WorldControllerThread {
  private static receiver = new ThreadReceiver<WorldControllerMessage>((message) => {
    
    switch (message.command) {
      case 'nextFrame':
        const cameraPos = new Vector3(...message.data.cameraPos);
        WorldControllerThread.worldManager?.processFrame(message.data.frameIndex, cameraPos);
        break;

      case 'configUpdate':
        const newConfig = {
          ...message.data,
          worldGenerator: new RandomFlatWorldGenerator(),
        }
        if (this.worldManager) {
          this.worldManager = this.worldManager.new(newConfig);
        } else {
          this.worldManager = new ThreadedSceneManager(newConfig, this.receiver);
        }
        break;
    
      default:
        break;
    }
  });
  
  private static worldManager: ThreadedSceneManager | undefined;

  
}

import { Vector3 } from "three";
import ThreadedWorldManager from "../classes/ThreadedWorldManager.ts";
import { WorldControllerMessage } from "../classes/WorldController.ts";
import ThreadReceiver from "../utils/ThreadReceiver.ts";


export default class WorldControllerThread {
  private static receiver = new ThreadReceiver<WorldControllerMessage>((message) => {
    switch (message.command) {
      case 'nextFrame':
        const cameraPos = new Vector3(...message.data.cameraPos);
        WorldControllerThread.worldManager?.processFrame(message.data.frameIndex, cameraPos);
        break;

      case 'configUpdate':
        WorldControllerThread.worldManager = new ThreadedWorldManager(message.data, WorldControllerThread.receiver);
        break;
    
      default:
        break;
    }
  });
  
  private static worldManager: ThreadedWorldManager | undefined;

  
}

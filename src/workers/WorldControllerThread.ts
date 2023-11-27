import { WorldControllerMessage } from "../classes/WorldController.ts";
import WorldManager from "../classes/WorldManager.ts";
import ThreadReceiver from "../utils/ThreadReceiver.ts";


export default class WorldControllerThread {
  private static receiver = new ThreadReceiver<WorldControllerMessage>((message) => {
    switch (message.command) {
      case 'nextFrame':
        
        break;

      
    
      default:
        break;
    }
  });
  
  private static worldManager;

  
}

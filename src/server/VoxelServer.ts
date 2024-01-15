import Config from "../classes/Config.js";
import NetworkManager from "./NetworkManager.js";
import NetworkPlayerProxy from "./NetworkPlayerProxy.js";
import World from "./World.js";



export default class VoxelServer {
  private readonly config = new Config();
  private readonly networkManager = new NetworkManager((message) => console.log(message));
  private readonly proxy = new NetworkPlayerProxy(this.networkManager);
  private readonly world = new World(this.config, this.networkManager, this.proxy);
  

  constructor() {
    
  }


}
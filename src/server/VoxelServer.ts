import Config from "../classes/Config";
import NetworkManager from "./NetworkManager";
import NetworkPlayerProxy from "./NetworkPlayerProxy";
import World from "./World";



export default class VoxelServer {
  private readonly config = new Config();
  private readonly networkManager = new NetworkManager((message) => console.log(message));
  private readonly proxy = new NetworkPlayerProxy(this.networkManager);
  private readonly world = new World(this.config, this.networkManager, this.proxy);
  

  constructor() {
    
  }


}
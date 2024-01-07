import Config from "../classes/Config";
import NetworkManager from "./NetworkManager";
import World from "./World";



export default class VoxelServer {
  private readonly config = new Config();
  private readonly networkManager = new NetworkManager((message) => console.log(message));
  private readonly world = new World(this.config, this.networkManager);

  constructor() {
    
  }


}
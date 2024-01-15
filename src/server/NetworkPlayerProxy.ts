import Chunk from "../classes/Chunk.js";
import Config from "../classes/Config.js";
import { PlayerProxy, ProxyResponse } from "../types/PlayerProxy.js";
import Entity from "./Entity.js";
import NetworkManager from "./NetworkManager.js";
import Player from "./Player.js";


export default class NetworkPlayerProxy implements PlayerProxy {
  constructor(
    private readonly networkManager: NetworkManager,
  ) {}

  public sendChunks(players: Player[], chunks: Chunk): ProxyResponse {
    
  }

  public sendConfiguration(players: Player[], configuration: Config): ProxyResponse {
      
  }

  public updateEntity(players: Player[], entities: Entity[]): ProxyResponse {
      
  }
}
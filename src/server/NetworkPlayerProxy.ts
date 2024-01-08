import Chunk from "../classes/Chunk";
import Config from "../classes/Config";
import { PlayerProxy, ProxyResponse } from "../types/PlayerProxy";
import Entity from "./Entity";
import NetworkManager from "./NetworkManager";
import Player from "./Player";


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
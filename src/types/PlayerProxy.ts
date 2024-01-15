import Chunk from "../classes/Chunk.js";
import Config from "../classes/Config.js";
import Entity from "../server/Entity.js";
import Player from "../server/Player.js"

export type ProxyResponse = void | Promise<void>;

export type PlayerProxy = {
  sendConfiguration(players: Player[], configuration: Config): ProxyResponse;
  sendChunks(players: Player[], chunks: Chunk): ProxyResponse;
  updateEntity(players: Player[], entities: Entity[]): ProxyResponse;
}
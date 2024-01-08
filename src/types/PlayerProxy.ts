import Chunk from "../classes/Chunk"
import Config from "../classes/Config";
import Entity from "../server/Entity";
import Player from "../server/Player"

export type ProxyResponse = void | Promise<void>;

export type PlayerProxy = {
  sendConfiguration(players: Player[], configuration: Config): ProxyResponse;
  sendChunks(players: Player[], chunks: Chunk): ProxyResponse;
  updateEntity(players: Player[], entities: Entity[]): ProxyResponse;
}
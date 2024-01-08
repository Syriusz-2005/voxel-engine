import { Vector3 } from "three";
import Entity from "./Entity";
import { Flags } from "../types/Flags";
import { FlaggedEntity } from "../types/FlaggedEntity";



export default class Player extends Entity implements FlaggedEntity {
  public readonly flags: Flags = {
    GRAVITY_FORCE: .05,
    MAX_FALL_SPEED: 1,
  }

  constructor(
    pos: Vector3
  ) {
    super(pos);
  }
}
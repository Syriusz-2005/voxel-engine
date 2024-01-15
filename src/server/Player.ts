import { Vector3 } from "three";
import Entity from "./Entity.js";
import { Flags } from "../types/Flags.js";
import { FlaggedEntity } from "../types/FlaggedEntity.js";



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
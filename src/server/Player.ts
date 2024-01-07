import { Vector3 } from "three";
import Entity from "./Entity";
import { Flags } from "../types/Flags";



export default class Player extends Entity {
  private readonly flags: Flags = {
    GRAVITY_FORCE: .05,
    MAX_FALL_SPEED: 1,
  }

  constructor(
    pos: Vector3
  ) {
    super(pos);
  }
}
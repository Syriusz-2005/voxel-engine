import Entity from "./Entity";
import Player from "./Player";


export default class EntityList {
  constructor(
    private readonly entities: Entity[],
  ) {}

  public add(entity: Entity) {
    this.entities.push(entity);
  }

  public remove(entity: Entity) {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
    }
  }

  public get Entities(): Entity[] {
    return this.entities;
  }

  public get length(): number {
    return this.entities.length;
  }

  public get(index: number): Entity {
    return this.entities[index];
  }

  public getPlayers(): Player[] {
    return this.entities.filter(entity => entity instanceof Player) as Player[];
  }
}
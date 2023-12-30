import { EventDispatcher } from "three";


export default class TickingService extends EventDispatcher<{'tick': {tickIndex: number}}> {
  private tickIndex = 0;
  
  constructor(
    private readonly ticksPerSecond: number,
  ) {
    super();
    this.runTick();
  }

  private async runTick() {
    this.dispatchEvent({
      type: 'tick',
      tickIndex: this.tickIndex,
    });

    this.tickIndex++;
    setTimeout(() => this.runTick(), (60 / this.ticksPerSecond) * (1000 / 60));
  }
}
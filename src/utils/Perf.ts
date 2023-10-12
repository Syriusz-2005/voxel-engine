


export default class Perf {
  private timeIndex = 0;
  private prevTime: number | undefined;
  private timeSum: number = 0;

  constructor(
    private readonly name: string,
    private readonly aggregateTo: number = 1000,
  ) {}

  public start() {
    this.prevTime = performance.now();
  }

  public stop() {
    this.timeSum += performance.now() - this.prevTime!;
    this.timeIndex++;

    if (this.timeIndex % this.aggregateTo === 1) {
      console.log(`${this.name}: ${this.timeSum / this.aggregateTo}ms`);
      this.timeSum = 0;
    }
  }
}



export default class Timer {
  private prevTime: number = Date.now();
  
  constructor(
    private readonly secondsPerPeriod: number
  ) {}

  public useTimer(callback: () => void) {
    const currTime = Date.now();

    if (currTime - (this.prevTime ?? currTime) > 1000 * this.secondsPerPeriod) {
      callback();
      this.prevTime = currTime;
    }
  }
}
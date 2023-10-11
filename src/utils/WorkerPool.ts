
export type WorkerData = {
  worker: Worker;
  onResolve: (value: any) => void;
}

export default class WorkerPool {
  private workers: WorkerData[] = [];

  constructor(
    private readonly workersPath: string, 
    private readonly workersCount: number,
  ) {
    for (let i = 0; i <= this.workersCount; i++) {
      const worker = new Worker(this.workersPath, {type: 'module'});
      const initialWorkerData: WorkerData = {
        worker,
        onResolve: () => {},
      }
      worker.onmessage = (e) => {
        this.workers[i].onResolve(e.data);
      }
      this.workers.push(initialWorkerData);
    }
  }

  public async scheduleTask(data: any): Promise<any> {}

}
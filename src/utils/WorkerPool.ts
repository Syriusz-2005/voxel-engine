
export type WorkerData = {
  worker: Worker;
  isBusy: boolean;
}

export type TaskData = {
  command: string;
  data?: any;
}

export type Task = {
  data: {command: string, data: any};
  transfers?: Transferable[];
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

export default class WorkerPool {
  private workers: WorkerData[] = [];
  private tasks: Task[] = []; 

  constructor(
    private readonly workersPath: URL, 
    private readonly workersCount: number,
  ) {
    for (let i = 0; i < this.workersCount; i++) {
      const worker = new Worker(this.workersPath, {type: 'module'});
      const initialWorkerData: WorkerData = {
        worker,
        isBusy: false,
      }
      this.workers.push(initialWorkerData);
    }
  }

  private assignTask(worker: WorkerData, task: Task) {
    worker.isBusy = true;
    worker.worker.postMessage(task.data, {transfer: task.transfers});
    worker.worker.onmessage = (event) => {
      worker.isBusy = false;
      task.resolve(event.data);
      this.assignTaskFromQueue();
    }
    worker.worker.onerror = (event) => {
      worker.isBusy = false;
      task.reject(event);
      this.assignTaskFromQueue();
    }
  }

  private assignTaskFromQueue() {
    const freeWorker = this.workers.find((worker) => !worker.isBusy);
    if (freeWorker) {
      const task = this.tasks.shift();
      if (task) {
        this.assignTask(freeWorker, task);
      }
    }
  }

  public scheduleTask(data: TaskData, transfers?: Transferable[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.tasks.push({
        data,
        transfers,
        resolve,
        reject,
      });
      this.assignTaskFromQueue();
    });
  }

}
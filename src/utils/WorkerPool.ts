
export type WorkerData = {
  worker: Worker;
  isBusy: boolean;
}

export type TaskData = {
  command: string;
  data: any;
  spontaneus?: true;
}

export type Task = {
  data: TaskData;
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
    private readonly onSpontaneusMessage?: (data: TaskData) => void,
  ) {
    for (let i = 0; i < this.workersCount; i++) {
      const worker = new Worker(this.workersPath, {type: 'module'});
      const initialWorkerData: WorkerData = {
        worker,
        isBusy: false,
      }
      this.workers.push(initialWorkerData);
      worker.addEventListener('message', (event) => {
        if (event.data.spontaneus) {
          this.onSpontaneusMessage?.(event.data);
        }
      });
    }
  }

  public get FirstWorker(): Worker {
    return this.workers[0].worker;
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
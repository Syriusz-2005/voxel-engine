import { Message } from "./ThreadReceiver.js";
import WorkerPool from "./WorkerPool.js";


export default class ThreadController<M extends Message> {

  private readonly pool: WorkerPool;

  constructor(
    private readonly workerUrl: URL,
    private readonly onMessage: (data: M) => void,
  ) {
    this.pool = new WorkerPool(this.workerUrl, 1, (data: Message) => {
      this.onMessage(data as M);
    });
  }

  public async fetch(message: M, transferable?: Transferable[]): Promise<M> {
    return this.pool.scheduleTask(message, transferable);
  }

  public postMessage(message: M, transferable?: Transferable[]) {
    this.pool.FirstWorker.postMessage(message, {transfer: transferable});
  }
}
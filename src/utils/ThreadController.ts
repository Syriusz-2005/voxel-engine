import { Message } from "./ThreadReceiver.ts";
import WorkerPool from "./WorkerPool.ts";


export default class ThreadController<M extends Message> {

  private readonly pool: WorkerPool;

  constructor(
    private readonly workerUrl: URL,
  ) {
    this.pool = new WorkerPool(this.workerUrl, 1);
  }

  public async fetch(message: M, transferable?: Transferable[]): Promise<M> {
    return this.pool.scheduleTask(message, transferable);
  }
}
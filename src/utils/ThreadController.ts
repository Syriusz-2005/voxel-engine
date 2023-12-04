import { Message } from "./ThreadReceiver.ts";
import WorkerPool from "./WorkerPool.ts";


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
}
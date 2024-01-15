import Player from "../server/Player.js";
import { TaskData } from "./WorkerPool.js";

export type Message = TaskData;


export default class ThreadReceiver<M extends Message> {
  constructor(
    onMessage: (message: M) => void,
  ) {
    self.onmessage = (event) => {
      onMessage(event.data);
    };
  }

  public postMessage(to: Player[], message: M, spontaneus: boolean, transferable?: Transferable[]) {
    if (spontaneus) {
      message.spontaneus = spontaneus;
    }
    self.postMessage(message, {transfer: transferable});
  }
}
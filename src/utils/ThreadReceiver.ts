
export type Message = {
  command: string;
}


export default class ThreadReceiver<M extends Message> {
  constructor(
    private readonly onMessage: (message: M) => void,
  ) {
    self.onmessage = (event) => {
      this.onMessage(event.data);
    };
  }

  public postMessage(message: M, transferable?: Transferable[]) {
    self.postMessage(message, {transfer: transferable});
  }
}
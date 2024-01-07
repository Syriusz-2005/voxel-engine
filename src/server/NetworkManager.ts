import ThreadReceiver, { Message } from "../utils/ThreadReceiver";
import Player from "./Player";


export default class NetworkManager extends ThreadReceiver<Message> {

  constructor(
    onMessage: (message: Message) => void,
  ) {
    super(onMessage);
  }

  public override postMessage(to: Player[], message: Message, spontaneus: boolean, transferable?: Transferable[]) {
    
  }
}
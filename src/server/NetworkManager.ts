import ThreadReceiver, { Message } from "../utils/ThreadReceiver.js";
import Player from "./Player.js";
import {Server} from 'socket.io';
import express from 'express';
import {createServer} from 'node:http';
import { TaskData } from "../utils/WorkerPool.js";

export default class NetworkManager implements ThreadReceiver<Message> {
  private readonly app = express();
  private readonly server = createServer(this.app);
  private readonly io = new Server(this.server);

  constructor(
    onMessage: (message: Message) => void,
  ) {
    // this.onMessage = onMessage;
    this.io.on('connection', (event) => {
      console.log('someone connected');
      console.dir(event, {depth: 5});
    });
  }

  public postMessage(to: Player[], message: Message, spontaneus: boolean, transferable?: Transferable[]) {
    
  }
}
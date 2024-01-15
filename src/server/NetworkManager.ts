import ThreadReceiver, { Message } from "../utils/ThreadReceiver.js";
import Player from "./Player.js";
import {Server} from 'socket.io';
import express from 'express';
import {createServer} from 'node:http';

export default class NetworkManager extends ThreadReceiver<Message> {
  private readonly app = express();
  private readonly server = createServer(this.app);
  private readonly io = new Server(this.server);


  constructor(
    onMessage: (message: Message) => void,
  ) {
    super(onMessage);
    this.io.on('connection', (event) => {
      console.log('someone connected');
      console.dir(event, {depth: 5});
    });
  }

  public override postMessage(to: Player[], message: Message, spontaneus: boolean, transferable?: Transferable[]) {
    
  }
}
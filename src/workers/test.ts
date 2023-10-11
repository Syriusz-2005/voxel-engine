import { TaskData } from "../utils/WorkerPool";



console.log('Hello from worker!');

self.onmessage = (event) => {
  const data: TaskData = event.data;

  console.log('Worker received message:', data);

  switch (data.command) {
    case 'say':
      console.log(data.data);
      break;
  
    default:
      break;
  }

  self.postMessage('Hello from worker!');
}



export default class WorldController {
  private readonly controllerWorker = new Worker(
    new URL('../workers/WorkerWorldController', import.meta.url), {
      type: 'module'
    }
  );

  
}
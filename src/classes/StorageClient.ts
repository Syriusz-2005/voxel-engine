import { WorldConfig } from "../types/WorldConfig.ts";
import WorldScene from "./WorldScene.ts";

export type StoredChunk = {
  size: number;
  voxels: Uint8Array;
}


export default class StorageClient {
  private static WORLD_STORE = 'worlds';
  private static CHUNK_STORE = 'chunks';
  
  private static getDb(): Promise<IDBDatabase> {
    const req = indexedDB.open('saves', 1);
    req.onupgradeneeded = (event) => {
      const db: IDBDatabase = (event.target as any).result;
      db.createObjectStore(StorageClient.CHUNK_STORE, { keyPath: 'id' });
      db.createObjectStore(StorageClient.WORLD_STORE, { keyPath: 'id' });
    }
    return new Promise((resolve) => {
      req.onsuccess = (event) => {
        const db: IDBDatabase = (event.target as any).result;
        resolve(db);
      }  
    })
  }

  public static async createNew() {
    const db = await StorageClient.getDb();
    return new StorageClient(db);
  }

  constructor(
    private readonly db: IDBDatabase
  ) {}

  private getResult<T extends Object>(req: IDBRequest<T[]>) {
    return new Promise<T[]>((resolve) => {
      req.onsuccess = () => {
        resolve(req.result);
      }
    })
  }

  private waitForSuccess(req: IDBRequest) {
    return new Promise<void>((resolve) => {
      req.onsuccess = () => {
        resolve();
      }
    })
  }

  public async getSaveNames(): Promise<string[]> {
    const transaction = this.db.transaction([StorageClient.WORLD_STORE], 'readonly');
  
    const req = transaction.objectStore(StorageClient.WORLD_STORE).getAll();
    
    const worlds = await this.getResult<WorldConfig>(req);
    
    transaction.commit();
    return worlds.map((world) => world.name);
  }

  public async setSave(world: WorldConfig) {
    const transaction = this.db.transaction([StorageClient.WORLD_STORE], 'readwrite');
    const req = transaction.objectStore(StorageClient.WORLD_STORE).put(world);

    await this.waitForSuccess(req);

    transaction.commit();
  }
}
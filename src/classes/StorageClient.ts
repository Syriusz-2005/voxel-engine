
export type StoredChunk = {
  size: number;
  voxels: Uint8Array;
}


export default class StorageClient {
  
  private static getDb(): Promise<IDBDatabase> {
    const req = indexedDB.open('voxelData', 1);
    req.onupgradeneeded = (event) => {
      const db: IDBDatabase = (event.target as any).result;
      db.createObjectStore('voxels');
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
  ) {
    
  }

  public async putChunk(chunk: Uint8Array) {
    for (const voxel of chunk) {
      
    }
  }
}
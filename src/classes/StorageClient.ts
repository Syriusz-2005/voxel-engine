
export type StoredChunk = {
  size: number;
  voxels: Uint8Array;
}


export default class StorageClient {
  
  private static getDb(): Promise<IDBDatabase> {
    const req = indexedDB.open('voxelData', 1);
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
  
  private readonly voxels: IDBObjectStore;

  constructor(
    private readonly db: IDBDatabase
  ) {
    this.voxels = this.db.createObjectStore('voxels')
  }

  public async putChunk(chunk: Uint8Array) {
    for (const voxel of chunk) {
      this.voxels.put(voxel);
    }
  }
}
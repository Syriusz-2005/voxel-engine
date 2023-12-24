import {GUI} from 'three/addons/libs/lil-gui.module.min.js';


export type ConfigSettings = {
  readonly CHUNK_SIZE: number;
  readonly RENDER_DISTANCE: number;
  readonly CONTROLS: 'orbit' | 'pointer-lock';
  readonly VIEW: 'normal' | 'wireframe';
}

export default class Config {
  public readonly gui = new GUI({width: 310});

  public readonly settings = {
    CHUNK_SIZE: 20,
    CONTROLS: 'orbit',
    RENDER_DISTANCE: 10,
    VIEW: 'normal',
  } as ConfigSettings;

  public CHUNK_SIZE = this.gui.add(this.settings, 'CHUNK_SIZE', 2, 30, 1);
  public CONTROLS = this.gui.add(this.settings, 'CONTROLS', ['orbit', 'pointer-lock']);
  public RENDER_DISTANCE = this.gui.add(this.settings, 'RENDER_DISTANCE', 2, 40, 1);
  public view = this.gui.add(this.settings, 'VIEW', ['normal', 'wireframe']);

  private statsFolder = this.gui.addFolder('Rendering stats');

  public readonly visibleChunks = this.statsFolder.add({visibleChunks: 0}, 'visibleChunks').disable();

  public readonly chunkUpdates = this.statsFolder.add({chunkUpdates: 0}, 'chunkUpdates').disable();
  public readonly facesCount = this.statsFolder.add({facesCount: 0}, 'facesCount').disable();


  constructor() {
    this.gui.title('Controls & Stats');
  }

  public onChange(callback: (settings: ConfigSettings) => void) {
    this.gui.onChange(() => {
      callback(this.settings);
    });
  }
}
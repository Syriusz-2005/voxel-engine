import {GUI} from 'three/addons/libs/lil-gui.module.min.js';


export type ConfigSettings = {
  readonly CHUNK_SIZE: number;
  readonly RENDER_DISTANCE: number;
  readonly CONTROLS: 'orbit' | 'pointer-lock';
}

export default class Config {
  public readonly gui = new GUI({width: 310});

  public readonly settings = {
    CHUNK_SIZE: 20,
    CONTROLS: 'pointer-lock',
    RENDER_DISTANCE: 10,
  } as ConfigSettings;

  public CHUNK_SIZE = this.gui.add(this.settings, 'CHUNK_SIZE', 2, 30, 1);
  public CONTROLS = this.gui.add(this.settings, 'CONTROLS', ['orbit', 'pointer-lock']);
  public RENDER_DISTANCE = this.gui.add(this.settings, 'RENDER_DISTANCE', 2, 40, 1);
}
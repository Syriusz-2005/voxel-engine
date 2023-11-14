import {GUI} from 'three/addons/libs/lil-gui.module.min.js';


export type ConfigSettings = {
  readonly CHUNK_SIZE: number;
  readonly CONTROLS: 'orbit' | 'pointer-lock';
}

export default class Config {
  public readonly gui = new GUI({width: 310});

  public readonly settings = {
    CHUNK_SIZE: 20,
    CONTROLS: 'orbit',
  } as ConfigSettings;

  public CHUNK_SIZE = this.gui.add(this.settings, 'CHUNK_SIZE', 2, 30, 1);
  public CONTROLS = this.gui.add(this.settings, 'CONTROLS', ['orbit', 'pointer-lock']);
}
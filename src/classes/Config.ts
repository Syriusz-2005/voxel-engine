import {GUI} from 'three/addons/libs/lil-gui.module.min.js';



export default class Config {
  public readonly gui = new GUI({width: 310});

  public settings = {
    CHUNK_SIZE: 20,
  }

  public CHUNK_SIZE = this.gui.add(this.settings, 'CHUNK_SIZE', 2, 30, 1);
}
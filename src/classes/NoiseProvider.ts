
import { Noise } from 'noisejs';
import { Vector3 } from 'three';

export type NoiseConfig = {
  octaves: {frequency: number, strength: number}[];
}

export default class NoiseProvider {
  private noise: Noise;

  constructor(seed: number, private readonly config: NoiseConfig) {
    this.noise = new Noise(seed);
  }

  public getAt(vec: Vector3): number {
    return this.config.octaves.map(octave => {
        const pos = vec.clone().multiplyScalar(octave.frequency);
        return this.noise.simplex3(pos.x, pos.y, pos.z) * octave.strength
      })
      .reduce((acc, val) => acc + val, 0);
  }
}
import Noise from 'noisejs';



export default class NoiseProvider {
  private noise: Noise['Noise'];

  constructor(seed: number) {
    this.noise = new Noise.Noise(seed);
  }
}
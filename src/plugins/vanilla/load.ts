import { Vector3 } from "three";
import PluginApiProvider from "../../classes/PluginApiProvider";


export function main(api: PluginApiProvider) {
  const camera = api.getCamera();

  console.log(camera);

  setInterval(() => {
    camera.addPos(new Vector3(0, 0, 1));
  }, 1000);
}
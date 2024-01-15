import World from "./World.js";
import Log from "../utils/Log.js";
import fs from 'fs/promises';

export type Capability = 'EXECUTE_CODE' | 'EXECUTE_CODE_IN_ISOLATION';

export type Manifest = {
  pluginVersion: string;
  manifestVersion: number;
  name: string;
  description: string;
  capabilities: Capability[];
}


export default class PluginLoader {
  

  constructor(
    private readonly manager: World,
  ) {}

  private async loadFile(path: string) {
    return await fs.readFile(path, 'utf-8');
  }

  public async loadPlugin(name: string) {
    console.log(import.meta.url);
    const manifest = JSON.parse(await this.loadFile(`/plugins/${name}/manifest.json`)) as Manifest;
    console.log(manifest);

    if (!manifest.capabilities) {
      return Log.fromPluginLoader(`Plugin ${name} does not have capabilities`);
    }
    if (!manifest.name) {
      return Log.fromPluginLoader(`Plugin ${name} does not have name`);
    }
    if (!manifest.description) {
      return Log.fromPluginLoader(`Plugin ${name} does not have description`);
    }
    if (!manifest.pluginVersion) {
      return Log.fromPluginLoader(`Plugin ${name} does not have pluginVersion`);
    }
    if (!manifest.manifestVersion) {
      return Log.fromPluginLoader(`Plugin ${name} does not have manifestVersion`);
    }

    const willExecuteCode = manifest.capabilities.includes('EXECUTE_CODE');

    
    if (willExecuteCode) {
      // const {main} = await import(`/plugins/${name}/load`) as {main: (provider: PluginApiProvider) => void};
      // const provider = new PluginApiProvider(this.manager);
      // main(provider);
    }
    
    Log.fromPluginLoader(`The plugin ${name} has been loaded`);
  }
}
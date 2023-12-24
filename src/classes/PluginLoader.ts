import Log from "../utils/Log";
import PluginApiProvider from "./PluginApiProvider";
import ThreadedWorldManager from "./ThreadedWorldManager";

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
    private readonly manager: ThreadedWorldManager,
  ) {}

  public async loadPlugin(name: string) {
    const {default: manifest} = await import(`../plugins/${name}/manifest.json`) as {default: Manifest};
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
      const {main} = await import(`../plugins/${name}/load.ts`) as {main: (provider: PluginApiProvider) => void};
      const provider = new PluginApiProvider(this.manager);
      main(provider);
    }
    
    Log.fromPluginLoader(`The plugin ${name} has been loaded`);
  }
}
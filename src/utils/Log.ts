


export default class Log {
  public static fromPluginLoader(message: string) {
    console.log(`%c[PluginLoader] %c${message}`, 'color: green; font-weight: bold;', 'color: white');
  }
}
export class CEventEmitter<T extends (...args: any[]) => any> {
  private listeners: Array<T> = [];

  attach(listener: T) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(i => i !== listener);
    }
  }

  async emit(...args: Parameters<T>) {
    await Promise.all(this.listeners.map(listener => listener(...args)));
  }
}

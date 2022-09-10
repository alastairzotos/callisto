type ConstructorTypeOf<T> = new (...args:any[]) => T;

export class Container {
  private static instances: Map<ConstructorTypeOf<any>, any> = new Map<ConstructorTypeOf<any>, any>();

  static resolve<T>(cls: ConstructorTypeOf<T>): T {
    let instance = Container.instances.get(cls) as T;
    if (!instance) {
      instance = new cls();
      Container.instances.set(cls, instance);
    }
    return instance;
  }
}

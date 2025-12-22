import NodeEnvironment from "jest-environment-node";

export default class NoLocalStorageEnvironment extends NodeEnvironment {
  async setup(): Promise<void> {
    await super.setup();

    try {
      Object.defineProperty(this.global, "localStorage", {
        value: undefined,
        configurable: true,
        writable: true,
      });

      Object.defineProperty(this.global, "sessionStorage", {
        value: undefined,
        configurable: true,
        writable: true,
      });
    } catch {
      // Ignore if the environment prevents overriding the properties.
    }
  }
}

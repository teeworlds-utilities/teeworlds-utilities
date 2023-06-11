import { Md5 } from "ts-md5";

export default class Cache<T> {
  private store: {[key: string]: T};

  constructor() {
    this.store = {};
  }

  exists(key: string): boolean {
    return Object.hasOwn(this.store, key);
  }

  get(key: string): T | null {
    if (this.exists(key) === false) {
      return null;
    }

    return this.store[key];
  }

  set(key: string, value: T): boolean {
    if (this.exists(key) === true) {
      return false;
    }
    
    this.store[key] = value;

    return true;
  }

  set_and_get(key: string, value: T): T {
    this.set(key, value);

    return this.get(key);
  }

  reset(): this {
    this.store = {};
    
    return this;
  }
}

export function hashCacheKey(key: string): string {
  return Md5.hashStr(key);
}

import { Md5 } from "ts-md5";

/**
 * Cache
 * @template T
 */
export default class Cache<T> {
  private store: { [key: string]: T };

  constructor() {
    this.store = {};
  }

  /**
   * The function checks if a given key exists in an object and returns a boolean
   * value.
   * @param {string} key - Cache ID
   * @returns A boolean
   */
  exists(key: string): boolean {
    return Object.hasOwn(this.store, key);
  }

  /**
   * This function retrieves a value from a store based on a given key, and returns
   * null if the key does not exist.
   * @param {string} key - Cache ID
   * @returns If it exists, it returns its value, otherwise null.
   */
  get(key: string): T | null {
    if (this.exists(key) === false) {
      return null;
    }

    return this.store[key];
  }

  /**
   * This function sets a key-value pair in a store and returns true if successful,
   * false if the key already exists.
   * @param {string} key - Cache ID
   * @param {T} value - Cache value
   * @returns A boolean, indicating if the operation has been successfully.
   */
  set(key: string, value: T): boolean {
    if (this.exists(key) === true) {
      return false;
    }

    this.store[key] = value;

    return true;
  }

  /**
   * The function resets the store object and returns the instance of the class.
   * @returns this
   */
  reset(): this {
    this.store = {};

    return this;
  }
}

/**
 * This function takes a string key and returns its MD5 hash value as a string.
 * @param {string} key - Cache ID
 * @returns A MD5 hash
 */
export function hashCacheKey(key: string): string {
  return Md5.hashStr(key);
}

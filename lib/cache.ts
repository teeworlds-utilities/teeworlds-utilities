import { Md5 } from "ts-md5";


/**
 * Cache
 * @template T 
 */
export default class Cache<T> {
  private store: {[key: string]: T};

  constructor() {
    this.store = {};
  }

  /**
   * The function checks if a given key exists in an object and returns a boolean
   * value.
   * @param {string} key - string - a string value representing the key to be
   * checked for existence in the object.
   * @returns A boolean value indicating whether the key exists in the store or
   * not.
   */
  exists(key: string): boolean {
    return Object.hasOwn(this.store, key);
  }

  /**
   * This function retrieves a value from a store based on a given key, and returns
   * null if the key does not exist.
   * @param {string} key - a string representing the key of the value to be
   * retrieved from the store.
   * @returns The `get` method is returning the value associated with the given
   * `key` from the `store` object if it exists, otherwise it returns `null`. The
   * returned value has a type of `T | null`, which means it can be either the type
   * `T` or `null`.
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
   * @param {string} key - A string representing the key to be set in the data
   * store.
   * @param {T} value - The value parameter is of type T, which means it can be any
   * data type. It represents the value that will be associated with the key in the
   * data store.
   * @returns The `set` method is returning a boolean value. It returns `true` if
   * the key-value pair was successfully added to the store, and `false` if the key
   * already exists in the store and the value was not updated.
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
   * @returns The `reset()` method is returning the current object (`this`) after
   * resetting its `store` property to an empty object.
   */
  reset(): this {
    this.store = {};
    
    return this;
  }
}

/**
 * This function takes a string key and returns its MD5 hash value as a string.
 * @param {string} key - The `key` parameter is a string value that will be used to
 * generate a hash value using the `Md5` hashing algorithm. The resulting hash
 * value will be used as a cache key to store and retrieve data from a cache.
 * @returns The function `hashCacheKey` returns a string that is the result of
 * hashing the input `key` using the `Md5` algorithm.
 */
export function hashCacheKey(key: string): string {
  return Md5.hashStr(key);
}

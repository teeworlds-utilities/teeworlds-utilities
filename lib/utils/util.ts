/**
 * The function checks if a given string contains only digits.
 * @param {string} str - string parameter representing the input string that needs
 * to be checked for containing only digits.
 * @returns A boolean value is being returned.
 */
export function isDigit(str: string): boolean {
  for (const char of str) {
    if ('1234567890'.includes(char) === false) {
      return false;
    }
  }

  return true;
}

/**
 * The function genChunks takes a string and a size parameter and returns an array
 * of strings, each of which is a chunk of the original string with a length equal
 * to the size parameter.
 * @param {string} src - The `src` parameter is a string that represents the source
 * data that needs to be split into chunks.
 * @param {number} size - The `size` parameter is a number that represents the
 * maximum size of each chunk that the `genChunks` function will generate. The
 * function takes a string `src` and splits it into smaller chunks of size `size`.
 * If the length of the string is not evenly divisible by `size`, the
 * @returns The function `genChunks` returns an array of strings, where each string
 * is a chunk of the input `src` string with a maximum length of `size`.
 */
export function genChunks(src: string, size: number): string[] {
  const ret: string[] = [];

  for (let i = 0; i < src.length; i += size) {
    ret.push(src.slice(i, i + size));
  }

  return ret;
}

/**
 * The function returns the closest number to a given number n that is divisible by
 * another number m.
 * @param {number} n - The number for which we want to find the closest multiple of
 * m.
 * @param {number} m - The parameter `m` is a number used to find the closest
 * multiple of `m` to another number `n`.
 * @returns the closest multiple of `m` to `n`.
 */
export function closestNumber(n: number, m: number): number {
  const q = Math.floor(n / m);
  const n1 = m * q;
  let n2: number;

  if (n * m > 0) {
    n2 = m * (q + 1);
  } else {
    n2 = m * (q - 1);
  }

  if (Math.abs(n - n1) < Math.abs(n - n2)) {
    return n1;
  }

  return n2;
}

/**
 * The function checks if all needed arguments are present in a given array of
 * arguments.
 * @param {string[]} args - an array of strings representing the arguments that
 * were passed to a function
 * @param {string[]} neededArgs - The `neededArgs` parameter is a rest parameter
 * that allows the function to accept an arbitrary number of string arguments.
 * These arguments represent the required arguments that the function will check
 * for in the `args` array.
 * @returns a boolean value. It returns `true` if all the arguments in the
 * `neededArgs` array are present in the `args` array, and `false` otherwise.
 */
export function argsChecker(args: string[], ...neededArgs: string[]): boolean {
  for (const arg of args) {
    if (neededArgs.includes(arg) === false) {
      return false;
    }
  }

  return true;
}

/**
 * This TypeScript function extracts the name of a file from a given path.
 * @param {string} path - The `path` parameter is a string that represents a file
 * path.
 * @returns The function `getNameFromPath` takes a string `path` as input and
 * returns the name of the file from the path without the extension.
 */
export function getNameFromPath(path: string): string {
  return  path
    .split('/')
    .at(-1)
    .split(".")
    .at(0)
}

function isDigit(str: string): boolean {
  for (const char of str) {
    if ('1234567890'.includes(char) === false) {
      return false;
    }
  }

  return true;
}

function genChunks(src: string, size: number): string[] {
  const ret: string[] = [];

  for (let i = 0; i < src.length; i += size) {
    ret.push(src.slice(i, i + size));
  }

  return ret;
}

function closestNumber(n: number, m: number): number {
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

function argsChecker(args: string[], ...neededArgs: string[]): boolean {
  for (const arg of args) {
    if (neededArgs.includes(arg) === false) {
      return false;
    }
  }

  return true;
}

function getNameFromPath(path: string): string {
  return  path
    .split('/')
    .at(-1)
    .split(".")
    .at(0)
}

export {
  isDigit,
  genChunks,
  closestNumber,
  argsChecker,
  getNameFromPath,
};

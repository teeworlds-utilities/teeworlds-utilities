import { Position } from "../asset/base";

export function isDigit(str: string): boolean {
  for (const char of str) {
    if ('1234567890'.includes(char) === false) {
      return false;
    }
  }

  return true;
}

export function genChunks(src: string, size: number): string[] {
  const ret: string[] = [];

  for (let i = 0; i < src.length; i += size) {
    ret.push(src.slice(i, i + size));
  }

  return ret;
}

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

export function argsChecker(args: string[], ...neededArgs: string[]): boolean {
  for (const arg of args) {
    if (neededArgs.includes(arg) === false) {
      return false;
    }
  }

  return true;
}

export function getNameFromPath(path: string): string {
  return  path
    .split('/')
    .at(-1)
    .split(".")
    .at(0)
}

export function positionFromAngle(
  origin: Position,
  angle: number,
  distance: number
): Position {
  const radian = angle * (Math.PI / 180.0);
  
  return {
    x: origin.x + (distance * Math.cos(radian)),
    y: origin.y + (distance * Math.sin(radian))
  };  
}

export const TOP = 1 << 1;
export const DOWN = 1 << 2;
export const LEFT = 1 << 3;
export const RIGHT = 1 << 4;

export const DIRECTION_HORIZONTAL = LEFT | RIGHT;
export const DIRECTION_VERTICAL = TOP | DOWN;

class InvalidFile extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'InvalidFile';
  }
}

class InvalidAsset extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'InvalidAsset';
  }
}

class InvalidElement extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'InvalidElement';
  }
}

class InvalidColor extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'InvalidColor';
  }
}

class InvalidScene extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'InvalidScene';
  }
}

export {InvalidFile, InvalidAsset, InvalidElement, InvalidColor, InvalidScene};

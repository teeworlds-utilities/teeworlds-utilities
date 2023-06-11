class FancyDate extends Date {
  constructor() {
    super();
  }

  date(separator: string = '-'): string {
    return (
      this.getFullYear() + separator +
      (this.getMonth() + 1) + separator +
      this.getDate()
    );
  }

  time(separator: string = ':'): string {
    return (
      this.getHours() + separator +
      this.getMinutes() + separator +
      this.getSeconds()
    );
  }

  datetime(separator: string = ' '): string {
    return this.date() + separator + this.time();
  }
}

class FormattedDateTime {
  static get date(): string {
    return new FancyDate().date();
  }

  static get time(): string {
    return new FancyDate().time();
  }

  static get datetime(): string {
    return new FancyDate().datetime();
  }
}

export { FormattedDateTime };

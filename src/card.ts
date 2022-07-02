import {createCanvas, Canvas, CanvasRenderingContext2D} from 'canvas';

interface ICell<T> {
  x: number;
  y: number;
  w: number;
  h: number;
  content: T;
}

type CardCell = ICell<string>;

class CardTab {
  xOffset: number;
  yOffset: number;
  wCell: number;
  hCell: number;
  columns: {[key: string]: CardCell[]};

  constructor(xOffset: number, yOffset: number, wCell: number, hCell: number) {
    this.xOffset = xOffset;
    this.yOffset = yOffset;

    this.wCell = wCell;
    this.hCell = hCell;

    this.columns = {};
  }

  addColumn(title: string) {
    this.columns[title] = [];
  }

  addContent(title: string, content: string) {
    if (Object.keys(this.columns).includes(title) === false)
      this.addColumn(title);

    let cell;
    const columnLenght = this.columns[title].length;

    if (columnLenght === 0) {
      cell = {
        x: this.xOffset,
        y: this.yOffset,
        w: this.wCell,
        h: this.hCell,
        content: content,
      };
    } else {
      const lastCell = this.columns[title][columnLenght - 1];

      cell = {
        x: lastCell.x,
        y: lastCell.y,
        w: this.wCell,
        h: lastCell.h + this.hCell + 10, // -> spacing
        content: content,
      };
    }
    this.columns[title].push(cell);
  }
}

class TwCardBase {
  name: string;
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;

  constructor(name: string, w: number, h: number) {
    this.name = name;
    this.canvas = createCanvas(w, h);
    this.ctx = this.canvas.getContext('2d');
  }
}

class TwCard extends TwCardBase {
  constructor(name: string) {
    super(name, 470, 190);
  }
}

class TwCardStats extends TwCardBase {
  constructor(name: string) {
    super(name, 470, 420);
  }
}

export {TwCard, TwCardStats};

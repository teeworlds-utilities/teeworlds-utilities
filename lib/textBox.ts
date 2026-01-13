import { Canvas, CanvasRenderingContext2D, createCanvas } from "canvas";

import { roundedImage } from "./utils/canvas";

export interface ITextDescriptor {
  value: string;
  x: number;
  y: number;
  font: string;
  size: number;
  color: string;
}

export type Margin = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export interface ITextBox {
  title?: ITextDescriptor;
  content: ITextDescriptor;
  margin: Margin;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

abstract class AbstractTextZone implements ITextBox {
  title?: ITextDescriptor;
  content: ITextDescriptor;
  margin: Margin = {
    top: 15,
    bottom: 15,
    left: 15,
    right: 15,
  };
  color: string = "rgba(0, 0, 0, 0)";
  x: number;
  y: number;
  w: number;
  h: number;

  protected constructor() {}

  setTitle(title: ITextDescriptor): this {
    this.title = title;

    return this;
  }

  setContent(content: ITextDescriptor): this {
    this.content = content;

    return this;
  }

  setMargin(margin: Margin): this {
    this.margin = margin;

    return this;
  }

  setColor(color: string): this {
    this.color = color;
    return this;
  }

  setPos(x: number, y: number): this {
    this.x = x;
    this.y = y;

    return this;
  }

  get maxWidth(): number {
    return this.w - this.margin.left - this.margin.right;
  }
}

class CanvasTextZone extends AbstractTextZone {
  canvas: Canvas;
  readonly ctx: CanvasRenderingContext2D;

  constructor(width: number = 400, height: number = 256) {
    super();

    this.w = width;
    this.h = height;

    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext("2d");
  }

  private breakText(text: ITextDescriptor): this {
    this.ctx.save();

    this.ctx.font = text.size.toString() + "px " + text.font;

    let newText = "";
    let start = 0;
    let textY = text.y;

    for (let i = 0; i < text.value.length; i++) {
      const value = text.value.slice(start, i);
      const valueWidth = this.ctx.measureText(value).width;

      if (valueWidth > this.maxWidth) {
        newText += "\n";
        start = i;
        textY += text.size + text.size / 2;
      }

      if (textY > this.h - this.margin.bottom - text.size) {
        break;
      }

      newText += text.value[i];
    }

    if (newText === text.value) {
      this.alignCenter(text);
    } else {
      text.value = newText;
    }

    this.ctx.restore();

    return this;
  }

  private processText(text: ITextDescriptor): this {
    this.ctx.save();

    // Text configuration
    this.ctx.fillStyle = text.color;
    this.ctx.font = text.size.toString() + "px " + text.font;

    // Text drawing on the canvas context
    this.ctx.fillText(
      text.value,
      text.x + this.margin.left,
      text.y + this.margin.top,
    );

    this.ctx.restore();

    return this;
  }

  private alignCenter(text: ITextDescriptor): this {
    this.ctx.save();

    this.ctx.font = text.size.toString() + "px " + text.font;

    const textSize = this.ctx.measureText(text.value);
    text.x = (this.w - textSize.width) / 2 - this.margin.left;

    this.ctx.restore();

    return this;
  }

  private processBackground(): this {
    roundedImage(this.ctx, 0, 0, this.canvas.width, this.canvas.height, 15);

    this.ctx.clip();
    this.ctx.fillStyle = this.color;
    this.ctx.fill();

    return this;
  }

  process(): this {
    this.processBackground();

    if (this.title !== undefined) {
      this.alignCenter(this.title);
      this.processText(this.title);
    }

    this.breakText(this.content);
    this.processText(this.content);

    return this;
  }
}

export { CanvasTextZone };

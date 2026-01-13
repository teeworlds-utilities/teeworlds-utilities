import {
  Canvas,
  createCanvas,
  CanvasRenderingContext2D,
  registerFont,
} from "canvas";

import { CanvasTextZone, Margin, ITextDescriptor } from "./textBox";

import { getCanvasFromFile, roundedImage, saveCanvas } from "./utils/canvas";

import { files } from "./utils/files";

// Register Teeworlds font
registerFont(__dirname + "/../data/fonts/komikax.ttf", { family: "Komikax" });

enum CardTitle {
  USERNAME = "Username",
  CLANS = "Clan(s)",
  SINCE = "Playing since",
  GAMEMODES = "Gamemode(s)",
  DESCRIPTION = "Description",
}

export interface ICard {
  process(): Promise<this>;
  save: (dirname: string, filename: string) => this;
  setBackground: (path: string) => Promise<this>;
  setRandomBackground: (dirpath: string) => Promise<this>;
}

abstract class AbstractCanvasCard implements ICard {
  margin: Margin = {
    top: 15,
    bottom: 15,
    left: 15,
    right: 15,
  };

  protected font: string = "22px serif";
  protected background?: Canvas;
  protected textBoxes: { [key: string]: CanvasTextZone } = {};

  canvas: Canvas;
  protected ctx: CanvasRenderingContext2D;

  protected constructor(width: number, height: number) {
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext("2d");
  }

  setFont(font: string): this {
    this.font = font;

    return this;
  }

  setMargin(margin: Margin): this {
    this.margin = margin;

    return this;
  }

  get maxWidth(): number {
    return this.canvas.width - this.margin.left - this.margin.right;
  }

  get maxHeight(): number {
    return this.canvas.height - this.margin.top - this.margin.bottom;
  }

  protected processTextBoxes(): this {
    for (const title of Object.keys(this.textBoxes)) {
      const box = this.textBoxes[title];

      this.pasteCanvas(box.canvas, box.x, box.y, box.w, box.h);
    }

    return this;
  }

  async process(): Promise<this> {
    // Background
    this.processBackground();

    // Texts boxes
    this.processTextBoxes();

    return this;
  }

  protected pasteCanvas(
    canvas: Canvas,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
  ): this {
    this.ctx.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      dx,
      dy,
      dw,
      dh,
    );

    return this;
  }

  protected processBackground(): this {
    if (this.background === undefined) {
      return this;
    }

    // Apply a border radius to the canvas context
    roundedImage(this.ctx, 0, 0, this.canvas.width, this.canvas.height, 15);

    this.ctx.clip();

    // Paste the background canvas to the rounded one
    this.pasteCanvas(
      this.background,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    );

    return this;
  }

  async setBackground(path: string): Promise<this> {
    this.background = await getCanvasFromFile(path);

    return this;
  }

  async setRandomBackground(bg_folder: string): Promise<this> {
    const path = bg_folder;
    const backgrounds = files.list(path);
    const index = Math.floor(Math.random() * (backgrounds.length - 1));
    const backgroundPath = path + backgrounds[index];

    await this.setBackground(backgroundPath);

    return this;
  }

  save(path: string): this {
    saveCanvas(path, this.canvas);

    return this;
  }
}

export class PersonalCard extends AbstractCanvasCard {
  constructor() {
    super(400, 460);
  }

  async process(): Promise<this> {
    this.processBackground();

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    this.ctx.fill();

    this.processTextBoxes();

    return this;
  }

  private addTextBox(
    x: number,
    y: number,
    w: number,
    h: number,
    title: ITextDescriptor,
    content: ITextDescriptor,
  ): this {
    if (x < this.margin.left) {
      x = this.margin.left;
    }
    if (x + w > this.canvas.width - this.margin.right) {
      w = this.canvas.width - this.margin.right - x;
    }
    if (y < this.margin.top) {
      y = this.margin.top;
    }
    if (y + h > this.canvas.height - this.margin.bottom) {
      h = this.canvas.height - this.margin.bottom - y;
    }

    const textBox = new CanvasTextZone(w, h)
      .setPos(x, y)
      .setColor("rgba(255, 255, 255, 0.1)")
      .setTitle(title)
      .setContent(content)
      .process();

    this.textBoxes[textBox.title.value] = textBox;

    return this;
  }

  setUsername(content: string): this {
    this.addTextBox(
      this.margin.left,
      this.margin.top,
      215,
      80,
      {
        x: 0,
        y: 10,
        size: 16,
        font: "Komika Axis",
        color: "rgba(255, 255, 255, 0.50)",
        value: CardTitle.USERNAME,
      },
      {
        x: 0,
        y: 45,
        size: 20,
        font: "Komika Axis",
        color: "rgba(255, 255, 255, 0.90)",
        value: content,
      },
    );

    return this;
  }

  setSince(content: string): this {
    this.addTextBox(
      245,
      this.margin.top,
      150,
      80,
      {
        x: 0,
        y: 10,
        size: 14,
        font: "Komika Axis",
        color: "rgba(255, 255, 255, 0.50)",
        value: CardTitle.SINCE,
      },
      {
        x: 0,
        y: 45,
        size: 20,
        font: "Komika Axis",
        color: "rgba(255, 255, 255, 0.90)",
        value: content,
      },
    );

    return this;
  }

  setGamemode(content: string): this {
    this.addTextBox(
      0,
      110,
      11111,
      80,
      {
        x: 0,
        y: 10,
        size: 16,
        font: "Komika Axis",
        color: "rgba(255, 255, 255, 0.50)",
        value: CardTitle.GAMEMODES,
      },
      {
        x: 0,
        y: 45,
        size: 13,
        font: "Komika Axis",
        color: "rgba(255, 255, 255, 0.90)",
        value: content,
      },
    );

    return this;
  }

  setClan(content: string): this {
    this.addTextBox(
      0,
      205,
      11111,
      80,
      {
        x: 0,
        y: 10,
        size: 16,
        font: "Komika Axis",
        color: "rgba(255, 255, 255, 0.50)",
        value: CardTitle.CLANS,
      },
      {
        x: 0,
        y: 45,
        size: 13,
        font: "Komika Axis",
        color: "rgba(255, 255, 255, 0.90)",
        value: content,
      },
    );

    return this;
  }

  setDescription(content: string): this {
    this.addTextBox(
      0,
      300,
      11111,
      160,
      {
        x: 0,
        y: 10,
        size: 16,
        font: "Komika Axis",
        color: "rgba(255, 255, 255, 0.50)",
        value: CardTitle.DESCRIPTION,
      },
      {
        x: 0,
        y: 45,
        size: 13,
        font: "Komika Axis",
        color: "rgba(255, 255, 255, 0.90)",
        value: content,
      },
    );

    return this;
  }
}

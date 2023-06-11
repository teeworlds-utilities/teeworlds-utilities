import Skin from './asset/skin';
import {SceneError} from './error';
import { Logger } from './logger';
import { saveCanvas, getCanvasFromFile } from './utils/canvas';
import { files } from './utils/files'
import { argsChecker } from './utils/util';
import Cache from './cache';

import {Canvas, createCanvas, CanvasRenderingContext2D, ImageData} from 'canvas';
import * as fs from 'fs';

type RectangleData = [number, number, number, number];
type Position = [number, number];

class Entity {
  imgData: ImageData;
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;

  constructor(imgData: ImageData) {
    this.imgData = imgData;
    this.canvas = createCanvas(imgData.width, imgData.height);
    this.ctx = this.canvas.getContext('2d');

    this.fillCanvas();
  }

  fillCanvas() {
    this.ctx.putImageData(this.imgData, 0, 0);
  }
}

class Part extends Entity {
  destination: RectangleData;

  constructor(imgData: ImageData, destination: RectangleData) {
    super(imgData);
    this.destination = destination;
  }
}

class Scheme {
  static readonly DEFAULT_KEYS = ['size', 'actions'];

  path: string;
  data: {[key: string]: any};

  constructor(path: string) {
    this.path = path;
    this.data = {};
  }

  private checkScheme() {
    const args = Object.keys(this.data);

    if (argsChecker(args, ...Scheme.DEFAULT_KEYS) === false) {
      throw new SceneError('Missing arguments for the scheme');
    }
  }

  preprocess(scheme = null) {
    if (this.path) {
      this.dataFromFile(this.path);
    } else if (scheme) {
      this.data = scheme;
    } else {
      throw new SceneError('Missing scheme');
    }

    this.checkScheme();
  }

  dataFromFile(filepath: string) {
    const raw = fs.readFileSync(filepath);
    const scheme = JSON.parse(raw.toString());

    this.data = scheme;
  }
}

class Action {
  object: any;
  func: string;
  needArgs: string[];

  constructor(object: any, func: string, ...needArgs: string[]) {
    this.object = object;
    this.func = func;
    this.needArgs = needArgs;
  }

  async call(args: {[key: string]: any}) {
    const argsNames = Object.keys(args);
    const argsGoodOrder = [];

    if (argsChecker(this.needArgs, ...argsNames) === false)
      throw new SceneError('Missing args');

    for (const arg of this.needArgs) {
      argsGoodOrder.push(args[arg]);
      delete args[arg];
    }

    const optionalsArgs = Object.values(args);

    await this.object[this.func](...argsGoodOrder, ...optionalsArgs);
  }
}

class Actions {
  actions: {[key: string]: Action};

  constructor() {
    this.actions = {};
  }

  add(name: string, object: any, func: string, ...needArgs: string[]) {
    const action = new Action(object, func, ...needArgs);
    this.actions[name] = action;
  }

  get(name: string): Action | null {
    if (Object.hasOwn(this.actions, name) === false) {
      return null;
    }

    return this.actions[name];
  }

  async tryCall(name: string, args: {[key: string]: any}) {
    const action = this.get(name);

    if (action === null) return;

    await action.call(args);
  }
}

export default class Scene {
  canvas!: Canvas;
  ctx!: CanvasRenderingContext2D;

  private cache: Cache<Canvas>;
  private scheme: Scheme;
  private actions: Actions;
  private parts: Part[];

  constructor(path: string) {
    this.cache = new Cache()
    this.scheme = new Scheme(path);
    this.actions = new Actions();
    this.parts = [];
  }

  preprocess(scheme = null): this {
    // Get the scheme
    this.scheme.preprocess(scheme);

    // Add Action(s) in this.actions
    this.actions.add(
      'addLine',
      this,
      'addLine',
      'mapres',
      'source',
      'point_source',
      'point_destination'
    );

    this.actions.add(
      'addBlock',
      this,
      'addBlock',
      'mapres',
      'source',
      'destination'
    );

    this.actions.add(
      'setRandomBackground',
      this,
      'setRandomBackground',
      'folder'
    );

    this.actions.add(
      'addTee',
      this,
      'addTee',
      'skin',
      'destination'
    );

    this.actions.add(
      'setBackground',
      this,
      'setBackground',
      'image'
    );

    this.actions.add(
      'addSquare',
      this,
      'addSquare',
      'mapres',
      'source',
      'topLeft',
      'bottomRight'
    );

    // Init the scene canvas (with context)
    this.initCanvas();

    return this;
  }

  initCanvas() {
    const w = this.scheme.data['size']['w'];
    const h = this.scheme.data['size']['h'];

    this.canvas = createCanvas(w, h);
    this.ctx = this.canvas.getContext('2d');
  }

  saveScene(path: string): this {
    saveCanvas(path, this.canvas);

    return this;
  }

  async execScheme(): Promise<this> {
    const actions = this.scheme.data['actions'];

    for (const action of actions) {
      if (argsChecker(Object.keys(action), 'name', 'args') === false) continue;

      await this.actions.tryCall(action['name'], action['args']);
    }

    return this;
  }

  async renderScene() {
    await this.execScheme();

    for (const part of this.parts) {
      this.ctx.drawImage(
        part.canvas,
        0,
        0,
        part.canvas.width,
        part.canvas.height,
        ...part.destination
      );
    }
  }

  async addLine(
    mapres: string,
    source: RectangleData,
    pointSource: Position,
    pointDestination: Position
  ) {
    let [sx, sy] = pointSource;
    const [dx, dy] = pointDestination;
    const [w, h] = source.slice(2, 4);

    if (sx === dx && sy === dy) {
      throw new SceneError('Wrong usage');
    }

    if (sx > dx && sy > dy) {
      this.addLine(
        mapres,
        source,
        pointDestination,
        pointSource
      );
    }

    while (sx <= dx && sy <= dy) {
      await this.addBlock(
        mapres,
        source,
        [sx, sy, w, h]
      );

      if (sx === dx && sy === dy) break;
      if (sx < dx) sx += w;
      if (sy < dy) sy += h;
    }
  }

  async addBlock(
    mapres: string,
    source: RectangleData,
    destination: RectangleData
  ) {
    const canvas = await this.getCanvasFromCache(mapres);
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(...source);
    const part = new Part(imgData, destination);

    this.parts.push(part);
  }

  async addSquare(
    mapres: string,
    source: RectangleData,
    topLeft: Position,
    bottomRight: Position
  ) {
    const [w, h] = source.slice(2, 4);
    const [sx, sy] = topLeft;
    const [dx, dy] = bottomRight;

    for (let y = sy; y < dy; y += h) {
      for (let x = sx; x < dx; x += w) {
        await this.addBlock(mapres, source, [x, y, w, h]);
      }
    }
  }

  async setRandomBackground(bg_folder: string) {
    const path = bg_folder;
    const backgrounds = files.list(path);
    const index = Math.floor(Math.random() * (backgrounds.length - 1));
    const background = path + backgrounds[index];

    await this.setBackground(background);
  }

  async addTee(path: string, destination: RectangleData) {
    const tee = new Skin();

    try {
      await tee.loadFromPath(path);
      tee.render();
    } catch (err) {
      Logger.error(err);
      return;
    }

    const imgData = tee.renderCanvas
    .getContext('2d')
    .getImageData(
      0,
      0,
      tee.renderCanvas.width,
      tee.renderCanvas.height
    );
  
    this.parts.push(
      new Part(imgData, destination)
    );
  }

  async setBackground(image: string) {
    const canvas = await this.getCanvasFromCache(image);
    const ctx = canvas.getContext('2d');

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const part = new Part(imgData, [
      0,
      0,
      this.scheme.data['size']['w'],
      this.scheme.data['size']['h'],
    ]);

    this.parts.push(part);
  }

  async getCanvasFromCache(path: string): Promise<Canvas> {
    let canvas: Canvas;
    const canvasCache = this.cache.get(path);

    if (canvasCache !== null) {
      canvas = canvasCache;
    } else {
      canvas = await getCanvasFromFile(path);
      this.cache.set(path, canvas);
    }

    return canvas;
  }

  pasteCanvas(
    canvas: Canvas,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ): this {
    this.ctx.drawImage(
      canvas,
      0, 0, canvas.width, canvas.height,
      dx, dy, dw, dh
    );

    return this;
  }
}

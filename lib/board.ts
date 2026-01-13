import { Canvas, createCanvas } from 'canvas';
import { BoardError } from './error';
import { DEFAULT_METADATA, Dimensions, MinimalAsset, Position } from './asset/base';
import { cloneCanvas, resizeCanvas } from './utils/canvas';
import Skin, { SkinFull } from './asset/skin';
import { AssetHelpSize, EyeSkinPart, GameskinPart, SkinPart, WeaponGameSkinPart } from './asset/part';
import Gameskin from './asset/gameskin';

type Cell<T> = Position & {
  content: T;
}

type BoardConfig= {
  maxRowCell: number;
  maxLineCell: number;
  cellWidth: number;
  cellHeight: number;
  Xgap: number;
  Ygap: number;
}

class Board<T> {
  readonly cells: Cell<T>[];

  config: BoardConfig;
  
  constructor(config: BoardConfig) {
    this.cells = [];
    this.config = config;
  }

  getPosition(cellPosition: Position): Position {
    const c = this.config;

    return {
      x: cellPosition.x * (c.Xgap + c.cellWidth) + c.Xgap, 
      y: cellPosition.y * (c.Ygap + c.cellHeight) + c.Ygap
    };
  }

  getSize(): Dimensions {
    const c = this.config;
  
    return {
      w: c.maxRowCell * (c.cellWidth + c.Xgap) + c.Xgap,
      h: c.maxLineCell * (c.cellHeight + c.Ygap) + c.Ygap
    };
  }

  addCell(cell: Cell<T>): this {
    const usedCells = this.cells.length;
    const totalCells = this.config.maxRowCell * this.config.maxLineCell;

    if (totalCells - usedCells <= 0) {
      throw new BoardError('Not enough space.');
    }

    if (
      cell.x < 0
      || cell.y < 0
      || cell.x > this.config.maxRowCell
      || cell.y > this.config.maxLineCell
    ) {
      throw new BoardError('Invalid cell position');
    }

    this.cells.push(cell);
    
    return this;
  }

  addCells(...cells: Cell<T>[]): this {
    for (const c of cells) {
      this.addCell(c);
    }
    
    return this;
  }

  call(callback: (cell: Cell<T>) => void): this {
    for (const c of this.cells) {
      callback(c);
    }
    
    return this;
  }
}

function resizeBoardCanvas(board: Board<Canvas>) {
  board.call(
    (cell) => {
      let [w, h] = [cell.content.width, cell.content.height];
      let [maxW, maxH] = [board.config.cellWidth, board.config.cellHeight];

      if (w > maxW || h > maxH) {
        cell.content = resizeCanvas(
          cell.content,
          {w: maxW, h: maxH}
        );
      }
    }
  );
}

function processBoardCanvas(
  board: Board<Canvas>,
  resize: boolean = true
): MinimalAsset {
  // Resize the content in the cell
  if (resize === true) {
    resizeBoardCanvas(board);
  }

  const boardSize = board.getSize();
  const canvas = createCanvas(boardSize.w, boardSize.h);
  const ctx = canvas.getContext('2d');

  board.call(
    (cell) => {
      let position = board.getPosition(
        {x: cell.x, y: cell.y}
      );

      position.x += (board.config.cellWidth - cell.content.width) / 2;
      position.y += (board.config.cellHeight - cell.content.height) / 2;
      
      ctx.drawImage(
        cell.content,
        position.x,
        position.y
      );
    }
  );

  return new MinimalAsset(DEFAULT_METADATA)
    .loadFromCanvas(canvas);
}

const EMOTES: EyeSkinPart[] = [
  SkinPart.DEFAULT_EYE,
  SkinPart.ANGRY_EYE,
  SkinPart.PAIN_EYE,
  SkinPart.HAPPY_EYE,
  SkinPart.SCARY_EYE
];

const WEAPONS: WeaponGameSkinPart[] = [
  GameskinPart.HAMMER,
  GameskinPart.GUN,
  GameskinPart.SHOTGUN,
  GameskinPart.GRENADE,
  GameskinPart.LASER,
]

export function createSkinOverview(
  skin: Skin,
  gameskin: Gameskin,
  amount: number = 5
): MinimalAsset {
  if (amount < 1 || amount > EMOTES.length) {
    amount = EMOTES.length;
  }

  skin.scale(AssetHelpSize.DEFAULT);

  const board = new Board<Canvas>(
    {
      maxRowCell: amount,
      maxLineCell: 1,
      cellWidth: 210,
      cellHeight: 175,
      Xgap: 1,
      Ygap: 20
    }
  );

  const skinWeapon = new SkinFull()
    .setSkin(skin)
    .setGameskin(gameskin);

  for (let i = 0; i < amount; i++) {
    skin.setEyeAssetPart(EMOTES.at(i));

    skinWeapon
      .setWeapon(WEAPONS.at(i))
      .process();

    board.addCell(
      {
        x: i , y: 0,
        content: cloneCanvas(skinWeapon.canvas)
      }
    );
  }

  return processBoardCanvas(board, false);
}
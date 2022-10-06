interface ICard {
  process(): Promise<this>;
  save: (dirname: string, filename: string) => this;
  setBackground: (path: string) => Promise<this>;
  setRandomBackground: (dirpath: string) => Promise<this>;
}

export default ICard;

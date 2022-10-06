import ITextDescriptor from './textDescriptor';
import Margin from '../types/margin';

interface ITextBox {
  title?: ITextDescriptor,
  content: ITextDescriptor,
  margin: Margin,
  color: string;
  x: number,
  y: number,
  w: number,
  h: number
}
  
export default ITextBox;

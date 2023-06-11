import { ColorRGB, ColorHSL, ColorTwCode } from './color'

describe('Color converting', () => {
  test('From RGB to HSL', () => {
    const rgb = new ColorRGB(15, 123, 99);
    const hsl = rgb.hsl();

    expect(hsl.toArray()).toStrictEqual([167, 78, 27]);
  });

  test('From HSL to RGBA', () => {
    const hsl = new ColorHSL(167, 78, 27)
    const rgba = hsl.rgba()

    expect(rgba.toArray()).toStrictEqual([15, 123, 99, 255]);
  });

  test('From HSL to Teeworlds code', () => {
    const hsl = new ColorHSL(169, 100, 75)
    const twCode = hsl.twCode() as ColorTwCode;

    expect(twCode.code).toBe(7929728);
  });

  test('From Teeworlds code to HSL', () => {
    const code = new ColorTwCode(7929728)
    const hsl = code.hsl()

    console.log(hsl.toArray())

    expect(hsl.toArray()).toStrictEqual([ 169.41176470588235, 100, 75.29411764705883 ]);
  });
});

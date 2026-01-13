import { unlinkSync } from "fs";
import { PersonalCard } from "./card";

describe("Card", () => {
  test("Create a card without background", async () => {
    const card = new PersonalCard()
      .setUsername("Nagi01 {LAN}")
      .setSince("2014")
      .setGamemode("Vanilla GCTF FNG Gores ")
      .setClan("Fu and many others")
      .setDescription(
        "im the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earth",
      );

    await card.process();
  });

  test("Create a card with random background then save it", async () => {
    const path = "nagi_card_random.png";
    const card = new PersonalCard()
      .setUsername("Nagi01 {LAN}")
      .setSince("2014")
      .setGamemode("Vanilla GCTF FNG Gores ")
      .setClan("Fu and many others")
      .setDescription(
        "im the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earthim the best human on earth",
      );

    await card.setRandomBackground("./data/scenes/backgrounds/");
    await card.process();

    card.save(path);

    unlinkSync(path);
  });
});

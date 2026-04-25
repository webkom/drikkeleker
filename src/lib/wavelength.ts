import type { WavelengthCard } from "@/types/wavelength";

export function getRandomCard(
  cards: WavelengthCard[],
  usedCardIds: string[],
): WavelengthCard {
  const unusedCards = cards.filter((card) => !usedCardIds.includes(card.id));
  const availableCards = unusedCards.length > 0 ? unusedCards : cards;
  const randomIndex = Math.floor(Math.random() * availableCards.length);

  return availableCards[randomIndex];
}

export function calculateDifference(answer: number, guess: number): number {
  return Math.abs(answer - guess);
}

export function getDrinkResult(diff: number): string {
  if (diff === 0) {
    return "Perfekt treff. Clue-giveren deler ut 3 slurker.";
  }

  if (diff <= 1) {
    return "Veldig nærme. Clue-giveren deler ut 2 slurker.";
  }

  if (diff <= 3) {
    return "Godt lest. Clue-giveren deler ut 1 slurk.";
  }

  if (diff <= 5) {
    return "Litt utenfor. Gjeterne drikker 1 slurk.";
  }

  return "Langt unna. Gjeterne drikker 2 slurker.";
}

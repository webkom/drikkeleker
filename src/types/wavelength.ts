export type WavelengthPhase =
  | "intro"
  | "secret-answer"
  | "group-guess"
  | "reveal";

export type WavelengthCard = {
  id: string;
  leftLabel: string;
  rightLabel: string;
  word?: string;
  category?: string;
};

export type WavelengthRound = {
  card: WavelengthCard;
  answer: number | null;
  guess: number | null;
};

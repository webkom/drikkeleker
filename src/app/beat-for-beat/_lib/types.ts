export type TeamId = "A" | "B";
export type WordColor = "red" | "black";
export type Phase = "idle" | "setup" | "playing" | "game-over";
export type RoundPhase = "awaiting-pick" | "guessing" | "round-over";

export interface Word {
  text: string;
  color: WordColor;
  revealed: boolean;
}

export interface PhraseDraft {
  id: string;
  text: string;
  pointValue: number;
  spotifyTrackId?: string;
}

export interface Round {
  phraseId: string;
  phrase: string;
  words: Word[];
  pointValue: number;
  roundPhase: RoundPhase;
  activeTeam: TeamId;
  timerDeadline: number | null;
  timerDurationSec: number;
  pausedRemainingMs: number | null;
  awardedThisRound: boolean;
  spotifyTrackId?: string;
}

export interface GameState {
  version: 1;
  phase: Phase;
  teams: { A: string; B: string };
  scores: { A: number; B: number };
  defaults: {
    timerDurationSec: number;
    pointValue: number;
    redWordsCount: number;
  };
  queue: PhraseDraft[];
  currentIndex: number;
  round: Round | null;
  showTimerToAudience: boolean;
  updatedAt: number;
}

export const STORAGE_KEY = "beat-for-beat:v1";
export const CHANNEL_NAME = "beat-for-beat";

export const MIN_WORDS = 3;
export const MAX_WORDS = 10;

export const defaultState = (): GameState => ({
  version: 1,
  phase: "idle",
  teams: { A: "Lag 1", B: "Lag 2" },
  scores: { A: 0, B: 0 },
  defaults: { timerDurationSec: 30, pointValue: 1, redWordsCount: 2 },
  queue: [],
  currentIndex: 0,
  round: null,
  showTimerToAudience: true,
  updatedAt: Date.now(),
});

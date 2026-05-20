import {
  defaultState,
  type GameState,
  type PhraseDraft,
  type Round,
  type TeamId,
} from "./types";
import { assignColors, parsePhrase } from "./assignColors";

const stamp = (state: GameState): GameState => ({
  ...state,
  updatedAt: Date.now(),
});

const otherTeam = (team: TeamId): TeamId => (team === "A" ? "B" : "A");

const buildRound = (
  draft: PhraseDraft,
  durationSec: number,
  redWordsCount: number,
  activeTeam: TeamId,
): Round => {
  const words = assignColors(parsePhrase(draft.text), redWordsCount);
  return {
    phraseId: draft.id,
    phrase: draft.text,
    words,
    pointValue: draft.pointValue,
    roundPhase: "awaiting-pick",
    activeTeam,
    timerDeadline: null,
    timerDurationSec: durationSec,
    pausedRemainingMs: null,
    awardedThisRound: false,
    ...(draft.spotifyTrackId ? { spotifyTrackId: draft.spotifyTrackId } : {}),
  };
};

export const startGame = (state: GameState): GameState => {
  if (state.queue.length === 0) return state;
  const draft = state.queue[0];
  const round = buildRound(
    draft,
    state.defaults.timerDurationSec,
    state.defaults.redWordsCount ?? 2,
    "A",
  );
  return stamp({
    ...state,
    phase: "playing",
    currentIndex: 0,
    round,
  });
};

export const revealWord = (state: GameState, index: number): GameState => {
  if (!state.round) return state;
  const word = state.round.words[index];
  if (!word || word.revealed) return state;

  const words = state.round.words.map((w, i) =>
    i === index ? { ...w, revealed: true } : w,
  );

  if (word.color === "red") {
    const allRevealed = words.every((w) => w.revealed);
    if (allRevealed) {
      return stamp({
        ...state,
        round: {
          ...state.round,
          words,
          roundPhase: "round-over",
          timerDeadline: null,
          pausedRemainingMs: null,
        },
      });
    }
    return stamp({
      ...state,
      round: {
        ...state.round,
        words,
        roundPhase: "awaiting-pick",
        activeTeam: otherTeam(state.round.activeTeam),
        timerDeadline: null,
        pausedRemainingMs: null,
      },
    });
  }

  // black: start timer
  return stamp({
    ...state,
    round: {
      ...state.round,
      words,
      roundPhase: "guessing",
      timerDeadline: Date.now() + state.round.timerDurationSec * 1000,
      pausedRemainingMs: null,
    },
  });
};

export const awardPoints = (state: GameState): GameState => {
  if (!state.round || state.round.awardedThisRound) return state;
  const team = state.round.activeTeam;
  return stamp({
    ...state,
    scores: {
      ...state.scores,
      [team]: state.scores[team] + state.round.pointValue,
    },
    round: {
      ...state.round,
      words: state.round.words.map((w) => ({ ...w, revealed: true })),
      roundPhase: "round-over",
      timerDeadline: null,
      pausedRemainingMs: null,
      awardedThisRound: true,
    },
  });
};

export const passTurn = (state: GameState): GameState => {
  if (!state.round) return state;
  return stamp({
    ...state,
    round: {
      ...state.round,
      roundPhase: "awaiting-pick",
      activeTeam: otherTeam(state.round.activeTeam),
      timerDeadline: null,
      pausedRemainingMs: null,
    },
  });
};

export const expireTimer = (state: GameState): GameState => {
  if (!state.round) return state;
  if (state.round.awardedThisRound) return state;
  return passTurn(state);
};

export const pauseTimer = (state: GameState): GameState => {
  if (!state.round || state.round.timerDeadline == null) return state;
  const remaining = Math.max(0, state.round.timerDeadline - Date.now());
  return stamp({
    ...state,
    round: {
      ...state.round,
      timerDeadline: null,
      pausedRemainingMs: remaining,
    },
  });
};

export const resumeTimer = (state: GameState): GameState => {
  if (!state.round || state.round.pausedRemainingMs == null) return state;
  return stamp({
    ...state,
    round: {
      ...state.round,
      timerDeadline: Date.now() + state.round.pausedRemainingMs,
      pausedRemainingMs: null,
    },
  });
};

export const resetTimer = (state: GameState): GameState => {
  if (!state.round) return state;
  return stamp({
    ...state,
    round: {
      ...state.round,
      timerDeadline: Date.now() + state.round.timerDurationSec * 1000,
      pausedRemainingMs: null,
      roundPhase: "guessing",
    },
  });
};

export const adjustPointValue = (
  state: GameState,
  delta: number,
): GameState => {
  if (!state.round) return state;
  const next = Math.max(1, state.round.pointValue + delta);
  const actualDelta = next - state.round.pointValue;
  if (actualDelta === 0) return state;

  const scores = state.round.awardedThisRound
    ? {
        ...state.scores,
        [state.round.activeTeam]:
          state.scores[state.round.activeTeam] + actualDelta,
      }
    : state.scores;

  return stamp({
    ...state,
    scores,
    round: { ...state.round, pointValue: next },
  });
};

export const nextPhrase = (state: GameState): GameState => {
  const nextIndex = state.currentIndex + 1;
  if (nextIndex >= state.queue.length) {
    return stamp({
      ...state,
      phase: "game-over",
      round: null,
    });
  }
  const draft = state.queue[nextIndex];
  const previousTeam = state.round?.activeTeam ?? "A";
  const round = buildRound(
    draft,
    state.defaults.timerDurationSec,
    state.defaults.redWordsCount ?? 2,
    otherTeam(previousTeam),
  );
  return stamp({
    ...state,
    currentIndex: nextIndex,
    round,
  });
};

export const resetGame = (): GameState => defaultState();

export const addPhrase = (
  state: GameState,
  text: string,
  pointValue?: number,
  spotifyTrackId?: string,
): GameState => {
  const draft: PhraseDraft = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
    text: text.trim(),
    pointValue: pointValue ?? state.defaults.pointValue,
    ...(spotifyTrackId ? { spotifyTrackId } : {}),
  };
  return stamp({ ...state, queue: [...state.queue, draft] });
};

export const removePhrase = (state: GameState, id: string): GameState =>
  stamp({ ...state, queue: state.queue.filter((p) => p.id !== id) });

export const updatePhrasePoints = (
  state: GameState,
  id: string,
  delta: number,
): GameState =>
  stamp({
    ...state,
    queue: state.queue.map((p) =>
      p.id === id ? { ...p, pointValue: Math.max(1, p.pointValue + delta) } : p,
    ),
  });

export const updateTeams = (
  state: GameState,
  teams: { A: string; B: string },
): GameState => stamp({ ...state, teams });

export const reorderPhrase = (
  state: GameState,
  id: string,
  direction: "up" | "down",
): GameState => {
  const index = state.queue.findIndex((p) => p.id === id);
  if (index === -1) return state;
  const newIndex = direction === "up" ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= state.queue.length) return state;

  const newQueue = [...state.queue];
  const temp = newQueue[index];
  newQueue[index] = newQueue[newIndex];
  newQueue[newIndex] = temp;

  return stamp({ ...state, queue: newQueue });
};

export const updatePhraseText = (
  state: GameState,
  id: string,
  newText: string,
): GameState => {
  return stamp({
    ...state,
    queue: state.queue.map((p) =>
      p.id === id ? { ...p, text: newText.trim() } : p,
    ),
  });
};

export const updateDefaults = (
  state: GameState,
  defaults: { timerDurationSec: number; pointValue: number; redWordsCount: number },
): GameState => stamp({ ...state, defaults });

export const adjustScore = (
  state: GameState,
  team: TeamId,
  delta: number,
): GameState =>
  stamp({
    ...state,
    scores: {
      ...state.scores,
      [team]: Math.max(0, state.scores[team] + delta),
    },
  });

export const toggleAudienceTimer = (state: GameState): GameState =>
  stamp({ ...state, showTimerToAudience: !state.showTimerToAudience });

export const revealAllWords = (state: GameState): GameState => {
  if (!state.round) return state;
  return stamp({
    ...state,
    round: {
      ...state.round,
      words: state.round.words.map((w) => ({ ...w, revealed: true })),
      roundPhase: "round-over",
      timerDeadline: null,
      pausedRemainingMs: null,
    },
  });
};


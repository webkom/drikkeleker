"use client";

import { useCallback, useEffect, useState } from "react";
import {
  applyBeatAction,
  beatRoomFromSnapshot,
  listenToBeatRoom,
  type BeatFirebaseRoom,
} from "@/lib/firebaseBeatRooms";
import { doc, getDoc } from "firebase/firestore";
import { ensureFirebaseUser, getFirebaseDb } from "@/lib/firebase";
import type { GameState } from "./types";

export interface UseBeatRoomResult {
  room: BeatFirebaseRoom | null;
  state: GameState | null;
  isHost: boolean;
  loading: boolean;
  error: string | null;
  applyAction: (action: (state: GameState) => GameState) => Promise<void>;
}

export function useBeatRoom(roomCode: string | null): UseBeatRoomResult {
  const [room, setRoom] = useState<BeatFirebaseRoom | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ensureFirebaseUser()
      .then((user) => {
        if (!cancelled) setUid(user.uid);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!roomCode) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    // Prime with a single getDoc so the loading flag flips quickly even if
    // the snapshot listener takes a moment to deliver its first event.
    getDoc(doc(getFirebaseDb(), "rooms", roomCode.trim().toLowerCase()))
      .then((snap) => {
        const initial = beatRoomFromSnapshot(snap);
        setRoom(initial);
        if (!initial) setError("Fant ikke rommet");
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      });

    const unsubscribe = listenToBeatRoom(
      roomCode,
      (r) => {
        setRoom(r);
        if (!r) setError("Fant ikke rommet");
        else setError(null);
      },
      (e) => setError(e.message),
    );
    return () => unsubscribe();
  }, [roomCode]);

  const applyAction = useCallback(
    async (action: (state: GameState) => GameState) => {
      if (!roomCode) return;
      try {
        await applyBeatAction(roomCode, action);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [roomCode],
  );

  return {
    room,
    state: room?.state ?? null,
    isHost: !!room && !!uid && room.hostUid === uid,
    loading,
    error,
    applyAction,
  };
}

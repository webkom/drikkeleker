"use client";

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Play} from "lucide-react";
import {startGame, updateDefaults, updateTeams} from "../_lib/gameActions";
import type {GameState} from "../_lib/types";
import PhraseQueueEditor from "./PhraseQueueEditor";

interface Props {
	state: GameState;
	applyAction: (action: (state: GameState) => GameState) => Promise<void>;
}

export default function SetupForm({state, applyAction}: Props) {
	const canStart = state.queue.length > 0;

	return (
		<div className="flex flex-col gap-6 w-full max-w-2xl bg-white/80 rounded-2xl shadow p-6">
			<div className="grid grid-cols-2 gap-3">
				<div className="flex flex-col gap-1">
					<label className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
						Lag A
					</label>
					<Input
						value={state.teams.A}
						onChange={(e) =>
							applyAction((s) =>
								updateTeams(s, {...s.teams, A: e.target.value}),
							)
						}
						className="bg-white"
					/>
				</div>
				<div className="flex flex-col gap-1">
					<label className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
						Lag B
					</label>
					<Input
						value={state.teams.B}
						onChange={(e) =>
							applyAction((s) =>
								updateTeams(s, {...s.teams, B: e.target.value}),
							)
						}
						className="bg-white"
					/>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-3">
				<div className="flex flex-col gap-1">
					<label className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
						Timer (sek)
					</label>
					<Input
						type="number"
						min={5}
						max={300}
						value={state.defaults.timerDurationSec}
						onChange={(e) => {
							const value = Math.max(5, Number(e.target.value) || 30);
							applyAction((s) =>
								updateDefaults(s, {
									...s.defaults,
									timerDurationSec: value,
									redWordsCount: s.defaults.redWordsCount ?? 2,
								}),
							);
						}}
						className="bg-white"
					/>
				</div>
				<div className="flex flex-col gap-1">
					<label className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
						Poeng pr rett
					</label>
					<Input
						type="number"
						min={1}
						value={state.defaults.pointValue}
						onChange={(e) => {
							const value = Math.max(1, Number(e.target.value) || 1);
							applyAction((s) =>
								updateDefaults(s, {
									...s.defaults,
									pointValue: value,
									redWordsCount: s.defaults.redWordsCount ?? 2,
								}),
							);
						}}
						className="bg-white"
					/>
				</div>
				<div className="flex flex-col gap-1">
					<label className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
						Røde felter
					</label>
					<Input
						type="number"
						min={0}
						max={5}
						value={state.defaults.redWordsCount ?? 2}
						onChange={(e) => {
							const value = Math.max(
								0,
								Math.min(5, Number(e.target.value) ?? 2),
							);
							applyAction((s) =>
								updateDefaults(s, {
									...s.defaults,
									redWordsCount: value,
								}),
							);
						}}
						className="bg-white"
					/>
				</div>
			</div>

			<PhraseQueueEditor state={state} applyAction={applyAction} />

			<Button
				size="lg"
				disabled={!canStart}
				onClick={() => applyAction(startGame)}
				className="self-stretch gap-2"
			>
				<Play size={20} /> Start spillet
			</Button>
			{!canStart && (
				<p className="text-xs text-center text-gray-500">
					Legg til minst én frase for å starte.
				</p>
			)}
		</div>
	);
}

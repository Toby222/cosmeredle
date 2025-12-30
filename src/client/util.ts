import { emojiFromOverlap, Overlap, type OverlapType } from "lib/util";

export type StoredGuess = [
	OverlapType,
	OverlapType,
	OverlapType,
	OverlapType,
	OverlapType,
	number,
];

export const OVERLAP_COLORS = {
	[Overlap.None]: "red",
	[Overlap.Partial]: "yellow",
	[Overlap.Full]: "green",
	Placeholder: "#444",
} as const;

export function emojiFromGuess(guess: StoredGuess): string {
	return (guess.slice(0, 5) as OverlapType[]).map(emojiFromOverlap).join("");
}

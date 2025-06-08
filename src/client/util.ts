import { insertCss } from "aberdeen";
import { Overlap, type OverlapType } from "lib/util";

export type StoredGuess = [
	OverlapType,
	OverlapType,
	OverlapType,
	OverlapType,
	OverlapType,
	number,
];

export const OVERLAP_STYLES = {
	[Overlap.None]: insertCss({ background: "red" }),
	[Overlap.Partial]: insertCss({ background: "yellow" }),
	[Overlap.Full]: insertCss({ background: "green" }),
	Placeholder: insertCss({ background: "#444" }),
} as const;

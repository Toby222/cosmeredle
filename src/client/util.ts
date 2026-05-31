import A from "aberdeen";

import type { OverlapType } from "lib/util";
import settings from "./settings";

export type StoredGuess = [
	OverlapType,
	OverlapType,
	OverlapType,
	OverlapType,
	OverlapType,
	number,
];

export function emojiFromOverlap(overlap: OverlapType): string | undefined {
	return A.peek(() => {
		switch (overlap) {
			case "Full":
				return settings.emojiOverlapFull.ref.value;
			case "Partial":
				return settings.emojiOverlapPartial.ref.value;
			case "None":
				return settings.emojiOverlapNone.ref.value;
		}
	});
}

export function emojiFromGuess(guess: StoredGuess): string {
	return (guess.slice(0, 5) as OverlapType[]).map(emojiFromOverlap).join("");
}

import { expect, test } from "bun:test";

import { getBestGuessOutOfPossible, overlapValidFor, playGame } from "./solve";
import { charactersForToday, Overlap } from "./util";

test("Overlaps work", () => {
	expect(overlapValidFor(Overlap.Full, Overlap.Full)).toBeTrue();
	expect(overlapValidFor(Overlap.Full, Overlap.Partial)).toBeFalse();
	expect(overlapValidFor(Overlap.Full, Overlap.None)).toBeFalse();
	expect(overlapValidFor(Overlap.Partial, Overlap.Full)).toBeTrue();
	expect(overlapValidFor(Overlap.Partial, Overlap.Partial)).toBeTrue();
	expect(overlapValidFor(Overlap.Partial, Overlap.None)).toBeFalse();
	expect(overlapValidFor(Overlap.None, Overlap.Full)).toBeFalse();
	expect(overlapValidFor(Overlap.None, Overlap.Partial)).toBeFalse();
	expect(overlapValidFor(Overlap.None, Overlap.None)).toBeTrue();
});

test("Always pick first", () => {
	const characters = charactersForToday();
	for (const char of characters) {
		expect(getBestGuessOutOfPossible([char])).toBe(char);
	}
});

test("There is a character you play in one", () => {
	const characters = charactersForToday();
	const bestGuess = getBestGuessOutOfPossible(characters);

	expect(playGame(characters, bestGuess, false)).toHaveLength(1);
});

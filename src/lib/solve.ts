import { characterForDay } from "server/util";
import {
	type Character,
	charactersForDay,
	compareCharacters,
	daysSinceEpoch,
	getCharacterName,
	Overlap,
	type OverlapType,
} from "./util";

export const TARGET_RATIO = 0.5;
export function getBestGuessOutOfPossible(characters: Character[]): Character {
	return characters
		.map(
			(character) =>
				[
					character,
					characters.length * TARGET_RATIO -
						characters.filter(
							(y) => !compareCharacters(character, y).includes(Overlap.None),
						).length,
				] as const,
		)
		.sort((guessA, guessB) => guessA[1] - guessB[1])[0][0];
}

export type SolveGuess = [
	string,
	[OverlapType, OverlapType, OverlapType, OverlapType, OverlapType],
];

export function overlapValidFor(min: OverlapType, value: OverlapType) {
	switch (min) {
		case Overlap.Full:
			return value === Overlap.Full;
		case Overlap.Partial:
			return value === Overlap.Full || value === Overlap.Partial;
		case Overlap.None:
			return value === Overlap.None;
	}
}

export function characterIsValid(
	character: Character,
	guess: SolveGuess,
	remainingCharacters: Character[],
) {
	const guessedChar = remainingCharacters.find(
		(char) => getCharacterName(char) === guess[0],
	);
	if (guessedChar === undefined)
		throw new Error(`undefined character "${guess[0]}"`);

	return compareCharacters(character, guessedChar).every((overlap, idx) =>
		overlapValidFor(overlap, guess[1][idx]),
	);
}

export function playGame(day?: number): SolveGuess[];
export function playGame(
	characters: Character[],
	correctAnswer: Character,
): SolveGuess[];
export function playGame(
	dayOrCharacters?: number | Character[],
	solution?: Character,
): SolveGuess[] {
	dayOrCharacters ??= daysSinceEpoch();

	const characters =
		typeof dayOrCharacters === "number"
			? charactersForDay(dayOrCharacters)
			: dayOrCharacters;
	const correctAnswer =
		typeof dayOrCharacters === "number"
			? characterForDay(dayOrCharacters)
			: solution;
	if (correctAnswer === undefined) throw new Error("Missing solution");

	let remainingCharacters = characters.slice();
	const guessesMade = [] as SolveGuess[];
	while (remainingCharacters.length > 0) {
		const bestGuess = getBestGuessOutOfPossible(remainingCharacters);
		const comparison = compareCharacters(bestGuess, correctAnswer);
		guessesMade.push([getCharacterName(bestGuess), comparison]);

		if (comparison.every((overlap) => overlap === Overlap.Full)) break;

		remainingCharacters = remainingCharacters.filter(
			(remainingCharacter) =>
				!guessesMade
					.map((x) => x[0])
					.includes(getCharacterName(remainingCharacter)) &&
				characterIsValid(
					remainingCharacter,
					guessesMade.at(-1) as SolveGuess,
					remainingCharacters,
				),
		);
	}
	return guessesMade;
}

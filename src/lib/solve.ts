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

type ParGame = [guesses: SolveGuess[], par: number];
export function playGame(day?: number): ParGame;
export function playGame(
	characters: Character[],
	correctAnswer: Character,
): ParGame;
/**
 * Returns the game and the par value.
 */
export function playGame(
	dayOrCharacters?: number | Character[],
	solution?: Character,
): ParGame {
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
	let par = 0;

	/// Handle endgame specially
	/// Endgame -> You got an XGGGG and now you're just guessing the valid characters
	let endGame = false;

	let lastGuess: Character;

	while (remainingCharacters.length > 0) {
		par++;
		lastGuess = getBestGuessOutOfPossible(remainingCharacters);
		const comparison = compareCharacters(lastGuess, correctAnswer);
		guessesMade.push([getCharacterName(lastGuess), comparison]);

		if (comparison.slice(1).every((overlap) => overlap === Overlap.Full)) {
			endGame = comparison[0] !== Overlap.Full;
			break;
		}

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

	if (endGame) {
		// The last guess is random
		par -= 1;
		const similarCharacters = remainingCharacters.filter(
			(remainingCharacters) =>
				compareCharacters(lastGuess, remainingCharacters)
					.slice(1)
					.every((overlap) => overlap === Overlap.Full),
		);
		const count = similarCharacters.length;
		let expectedSum = 0;
		for (let i = 1; i <= count - 1; i++) {
			expectedSum += (count - i) / (count - i + 1);
		}
		// Approximation of how many guesses it would take to randomly guess the character
		par += expectedSum;
		// Rounded to look nice
		par = Math.round(par);
	}

	return [guessesMade, par];
}

import {
	type Character,
	compareCharacters,
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
		(char) => char.name.join(" ") === guess[0],
	);
	if (guessedChar === undefined) throw new Error("wtf bro");

	return compareCharacters(character, guessedChar).every((overlap, idx) =>
		overlapValidFor(overlap, guess[1][idx]),
	);
}

export function playGame(
	characters: Character[],
	correctAnswer: Character,
	debugLog: boolean,
) {
	let remainingCharacters = characters.slice();
	const guessesMade = [] as SolveGuess[];
	while (remainingCharacters.length > 0) {
		const bestGuess = getBestGuessOutOfPossible(remainingCharacters);
		guessesMade.push([
			bestGuess.name.join(" "),
			compareCharacters(bestGuess, correctAnswer),
		]);
		if (
			guessesMade[guessesMade.length - 1][1].every(
				(overlap) => overlap === Overlap.Full,
			)
		)
			break;
		const previouslyRemaining = remainingCharacters.length;
		remainingCharacters = remainingCharacters.filter(
			(remainingCharacter) =>
				!guessesMade
					.map((x) => x[0])
					.includes(remainingCharacter.name.join(" ")) &&
				characterIsValid(
					remainingCharacter,
					guessesMade.at(-1) as SolveGuess,
					remainingCharacters,
				),
		);
		if (debugLog) {
			console.debug(
				"Guessing:",
				guessesMade[guessesMade.length - 1][0],
				"Characters shed:",
				previouslyRemaining - remainingCharacters.length,
				"Characters remaining:",
				remainingCharacters.length,
				"Ratio after/before:",
				remainingCharacters.length / previouslyRemaining,
				"Target:",
				TARGET_RATIO,
			);
		}
	}
	return guessesMade;
}

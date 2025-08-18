#! /usr/bin/env bun
import {
	characterIsValid,
	getBestGuessOutOfPossible,
	type SolveGuess,
	TARGET_RATIO,
} from "lib/solve";
import { charactersForToday, Overlap, type OverlapType } from "lib/util";

const characters = charactersForToday();

async function readLine(prompt?: string): Promise<string> {
	if (prompt) process.stdout.write(prompt);
	for await (const line of console) {
		return line.trim();
	}
	return "";
}
async function readOverlap(
	prompt?: string,
): Promise<[OverlapType, OverlapType, OverlapType, OverlapType, OverlapType]> {
	let guess: (OverlapType | undefined)[];
	do {
		guess = (await readLine(prompt)).split("").map(getOverlapFromInput);
	} while (guess.includes(undefined) || guess.length !== 5);
	return guess as [
		OverlapType,
		OverlapType,
		OverlapType,
		OverlapType,
		OverlapType,
	];
}

function getOverlapFromInput(input: string): OverlapType | undefined {
	switch (input.toLowerCase()[0]) {
		case "r":
			return Overlap.None;
		case "y":
			return Overlap.Partial;
		case "g":
			return Overlap.Full;
		default:
			return undefined;
	}
}

const guessesMade = [] as SolveGuess[];

let remainingCharacters = characters.slice();
while (remainingCharacters.length > 0) {
	const bestGuess = getBestGuessOutOfPossible(remainingCharacters);
	guessesMade.push([
		bestGuess.name.join(" "),
		await readOverlap(`Results of guessing ${bestGuess.name.join(" ")}: `),
	]);
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
	console.log(
		"Characters shed:",
		previouslyRemaining - remainingCharacters.length,
		"Characters remaining:",
		remainingCharacters.length,
		"Ratio after/before:",
		remainingCharacters.length / previouslyRemaining,
		"Target:",
		TARGET_RATIO,
	);
	console.log(remainingCharacters.map((c) => c.name.join(" ")).join(","));
}

const finalGuess = guessesMade[guessesMade.length - 1];

if (finalGuess[1].every((overlap) => overlap === Overlap.Full))
	console.log(
		"Correct character:",
		finalGuess[0],
		"Took",
		guessesMade.length,
		"guesses",
	);
else console.log("Lost, somehow?");

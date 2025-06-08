import { $, observe, onEach, proxy } from "aberdeen";
import { dateDiff, Overlap, type OverlapType } from "lib/util";
import { OVERLAP_STYLES, type StoredGuess } from "client/util";

import CHARACTERS from "lib/characters.json";
import { GuessRow } from "./components/GuessRow";
const previousGuesses: StoredGuess[] = proxy([]);
const availableCharacters = proxy(0);
const answerPending = proxy(true);
const selectedCharacter = proxy(0);
const start = Date.now();
const now = proxy(Date.now());
setInterval(() => {
	now.value = Date.now();
}, 100);

// Scope to not pollute file scope
{
	const previousGuessesStorage = localStorage.getItem("previousGuesses");
	if (previousGuessesStorage !== null) {
		const previousGuessesParsed = JSON.parse(previousGuessesStorage);
		for (const previousGuess of previousGuessesParsed) {
			previousGuesses.push(previousGuess);
			availableCharacters.value--;
		}
	}
	const previousIds = previousGuesses.map((guess) => guess[5]);
	availableCharacters.value = CHARACTERS.filter(
		(character) => !previousIds.includes(character.id),
	).length;
}
observe(() => {
	const unguessedCharacters = CHARACTERS.filter(
		(character) =>
			!previousGuesses.map((guess) => guess[5]).includes(character.id),
	);
	if (unguessedCharacters.length > 0)
		selectedCharacter.value = unguessedCharacters[0].id;
	else selectedCharacter.value = -1;
});
answerPending.value = false;

async function guess(characterId: number) {
	if (answerPending.value) return;
	answerPending.value = true;
	const answer = await (
		await fetch(`/guess/${characterId}`, { method: "POST" })
	).json();
	if (
		Array.isArray(answer) &&
		answer.length === 5 &&
		answer.every(
			(overlap) =>
				typeof overlap === "string" &&
				(Overlap as Record<string, string>)[overlap] !== undefined,
		)
	) {
		previousGuesses.push([
			...(answer as OverlapType[]),
			characterId,
		] as StoredGuess);
	} else {
		console.error("invalid answer", answer);
	}
	localStorage.setItem("previousGuesses", JSON.stringify(previousGuesses));
	answerPending.value = false;
}

$("div", { id: "timer", $color: "white" }, function renderTimer() {
	$(`span:${dateDiff(start, now.value, true)}`);
});

$("div", { id: "makeGuess" }, function renderMakeGuess() {
	if (availableCharacters.value > 0) {
		$(
			"select",
			() => {
				const guessedCharacters = previousGuesses.map((guess) => guess[5]);
				let availableCharacters = 0;
				for (const character of CHARACTERS) {
					if (!guessedCharacters.includes(character.id)) {
						$(`option:${character.name}`, { value: character.id });
						availableCharacters++;
					}
				}
			},
			{
				bind: selectedCharacter,
				".disabled": answerPending,
			},
		);

		$("button:Guess", {
			click() {
				guess(Number.parseInt(selectedCharacter.value.toString()));
			},
			".disabled": answerPending,
		});
	} else {
		$("span:You guessed all characters... how?");
	}
});

$("div", { id: "guesses" }, function renderGuesses() {
	$("div", { id: "guessHeader" }, () => {
		$("span.guessTitle:Name");
		$("span.guessTitle:Home World");
		$("span.guessTitle:First Appearance");
		$("span.guessTitle:Species");
		$("span.guessTitle:Abilities/Investiture");
	});
	onEach(previousGuesses, GuessRow, (_guess, idx) => -idx);
});

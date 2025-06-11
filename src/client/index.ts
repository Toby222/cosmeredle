import { $, observe, onEach, proxy } from "aberdeen";
import { dateDiff, Overlap, type OverlapType } from "lib/util";
import { emojiFromGuess, type StoredGuess } from "client/util";

import CHARACTERS from "lib/characters.json";
import { GuessRow } from "./components/GuessRow";
import { Footer } from "./components/Footer";
import { GuessBubble } from "./components/GuessBubble";
import { CustomSelectNumber } from "./components/CustomSelect";
const previousGuesses: StoredGuess[] = proxy([]);
const availableCharacters = proxy(0);
const answerPending = proxy(true);
const gameInProgress = proxy(true);
const shareLink = proxy(false);
const selectedCharacter = proxy<number | undefined>(undefined);
const now = proxy(Date.now());
setInterval(() => {
	now.value = Date.now();
}, 100);

const dates = (await (await fetch("/today")).json()) as {
	today: number;
	tomorrow: number;
};

if (localStorage.getItem("shareLink") === "true") {
	shareLink.value = true;
}

observe(() => {
	localStorage.setItem("shareLink", shareLink.value.toString());
})

const nextGame = dates.tomorrow;
if (
	localStorage.getItem("currentGame") === undefined ||
	localStorage.getItem("currentGame") !== dates.today.toString()
) {
	localStorage.clear();
	localStorage.setItem("currentGame", dates.today.toString());
}

// Scope to not pollute file scope
{
	const previousGuessesStorage = localStorage.getItem("previousGuesses");
	if (previousGuessesStorage !== null) {
		const previousGuessesParsed = JSON.parse(
			previousGuessesStorage,
		) as StoredGuess[];
		for (const previousGuess of previousGuessesParsed) {
			previousGuesses.push(previousGuess);
			if (
				previousGuess.slice(0, 5).every((overlap) => overlap === Overlap.Full)
			) {
				gameInProgress.value = false;
			}
			availableCharacters.value--;
		}
	}
	const previousIds = previousGuesses.map((guess) => guess[5]);
	availableCharacters.value = CHARACTERS.filter(
		(character) => !previousIds.includes(character.id),
	).length;
}
observe(() => {
	if (availableCharacters.value === 0) selectedCharacter.value = undefined;
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
		if (answer.every((overlap) => overlap === Overlap.Full)) {
			gameInProgress.value = false;
		}
	} else {
		console.error("invalid answer", answer);
	}
	localStorage.setItem("previousGuesses", JSON.stringify(previousGuesses));
	answerPending.value = false;
}

const hideGameOver = proxy(false);

$("main", () => {
	$("div", { id: "makeGuess" }, () => {
		if (availableCharacters.value > 0) {
			const guessedCharacters = previousGuesses.map((guess) => guess[5]);
			CustomSelectNumber(
				CHARACTERS.map((character) => ({
					label: character.name,
					value: character.id,
					disabled: guessedCharacters.includes(character.id),
				})),
				selectedCharacter,
				gameInProgress,
			);

			$("button:Guess", {
				click() {
					if (selectedCharacter.value !== undefined) {
						guess(selectedCharacter.value);
						selectedCharacter.value = undefined;
					}
				},
				".disabled": answerPending,
			});
		} else {
			$("span:You guessed all characters... how?");
		}
	});
	$("div", { id: "nextGame" }, () => {
		$(`span:Next game: ${dateDiff(now.value, nextGame, true)}`);
	});

	$("div", { id: "guesses" }, () => {
		$("div", { id: "guessHeader" }, () => {
			$("span.guessTitle:Name");
			$("span.guessTitle:Home World");
			$("span.guessTitle:First Appearance");
			$("span.guessTitle:Species");
			$("span.guessTitle:Abilities/Investiture");
		});
		onEach(
			previousGuesses,
			(guess) => GuessRow(guess),
			(_guess, idx) => -idx,
		);
		if (previousGuesses.length === 0) {
			$("div.guessRow", () => {
				GuessBubble("?", "Placeholder");
				GuessBubble("?", "Placeholder");
				GuessBubble("?", "Placeholder");
				GuessBubble("?", "Placeholder");
				GuessBubble("?", "Placeholder");
			});
		}
	});

	if (!hideGameOver.value) {
		$(
			"div",
			{
				id: "gameOver",
				".hidden": gameInProgress,
				click(event: MouseEvent) {
					if (event.target === this) {
						hideGameOver.value = true;
					}
				},
			},
			() => {
				$("div.popup", () => {
					$("span:Game over! ");
					$("hr");
					$(`span:You took ${previousGuesses.length} guesses`);

					const shareable = previousGuesses.map(emojiFromGuess).join("\n");
					$(`pre:${shareable}`);
					$("div", () => {
						$("label:Include link", () => {
							$("input", {
								type: "checkbox",
								bind: shareLink
							});
						});
						$("span: ")
						$("button:Copy", {
							click() {
								navigator.clipboard.writeText(
									`I got today's Cosmeredle in ${previousGuesses.length}!\n${shareable}${
										shareLink.value ? `\n${location.href}` : ""
									}`,
								);
							},
						});
					});
				});
			},
		);
	}
});
Footer();

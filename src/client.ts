import A from "aberdeen";
import { CustomSelectNumber } from "client/components/CustomSelect";
import { Footer } from "client/components/Footer";
import { GuessBubble } from "client/components/GuessBubble";
import { GuessRow } from "client/components/GuessRow";
import { emojiFromGuess, type StoredGuess } from "client/util";
import {
	charactersForToday,
	dateDiff,
	Overlap,
	type OverlapType,
} from "lib/util";

const previousGuesses: StoredGuess[] = A.proxy([]);
const availableCharacters = A.proxy(0);
const answerPending = A.proxy(true);
const gameInProgress = A.proxy(true);
const shareLink = A.proxy(false);
const spoilerWarningDismissed = A.proxy(
	localStorage.getItem("spoilerWarningDismissed") === "true",
);
const selectedCharacter = A.proxy<number | undefined>(undefined);
const now = A.proxy(Date.now());
setInterval(() => {
	now.value = Date.now();
}, 100);

const dates = (await (await fetch("/today")).json()) as {
	today: number;
	tomorrow: number;
};
const par = Number.parseInt(await (await fetch("/par")).text(), 10);

if (localStorage.getItem("shareLink") === "true") {
	shareLink.value = true;
}

A.derive(() => {
	localStorage.setItem("shareLink", shareLink.value.toString());
});
A.derive(() => {
	localStorage.setItem(
		"spoilerWarningDismissed",
		spoilerWarningDismissed.value.toString(),
	);
});

const nextGame = dates.tomorrow;
if (
	localStorage.getItem("currentGame") === undefined ||
	localStorage.getItem("currentGame") !== dates.today.toString()
) {
	localStorage.clear();
	localStorage.setItem("currentGame", dates.today.toString());
}

const characters = charactersForToday();
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
	const previousIdxs = previousGuesses.map((guess) => guess[5]);
	availableCharacters.value = characters.filter(
		(_character, idx) => !previousIdxs.includes(idx),
	).length;
}
A.derive(() => {
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

const hideGameOver = A.proxy(false);

A("main", () => {
	A("div", { id: "makeGuess" }, () => {
		const guessedCharacters = previousGuesses.map((guess) => guess[5]);
		function makeGuess() {
			if (selectedCharacter.value !== undefined) {
				guess(selectedCharacter.value);
				selectedCharacter.value = undefined;
			}
		}
		CustomSelectNumber(
			characters.map((character, idx) => ({
				label: character.name.join(" "),
				value: idx,
				disabled: guessedCharacters.includes(idx),
			})),
			selectedCharacter,
			gameInProgress,
			makeGuess,
		);

		A("button#Guess", {
			click: makeGuess,
			".disabled": answerPending,
		});
	});
	A("div", { id: "nextGame" }, () => {
		A(`span#Next game: ${dateDiff(now.value, nextGame, true)}`);
	});

	A("div", { id: "guesses" }, () => {
		A("div", { id: "guessHeader" }, () => {
			A("span.guessTitle#Name");
			A("span.guessTitle#Home World");
			A("span.guessTitle#First Appearance");
			A("span.guessTitle#Species");
			A("span.guessTitle#Abilities/Investiture");
		});
		A.onEach(
			previousGuesses,
			(guess) => GuessRow(guess),
			(_guess, idx) => -idx,
		);
		if (previousGuesses.length === 0) {
			A("div.guessRow", () => {
				GuessBubble("?", "Placeholder");
				GuessBubble("?", "Placeholder");
				GuessBubble("?", "Placeholder");
				GuessBubble("?", "Placeholder");
				GuessBubble("?", "Placeholder");
			});
		}
	});

	if (!spoilerWarningDismissed.value) {
		A(
			"div.popupWrapper",
			{
				id: "spoilerWarning",
				click() {
					spoilerWarningDismissed.value = true;
				},
			},
			() => {
				A("div.popup", () => {
					A("span#Spoiler warning!");
					A("hr");
					A("span", () => {
						A("#This game contains spoilers for ");
						A("em color:red fontStyle:cursive #all");
						A("# of the Cosmere!");
					});
					A(
						"span#Do not continue unless you're caught-up with all books or don't mind potentially getting spoiled.",
					);
					A("span#click/tap to close this notice, it will not be shown again");
				});
			},
		);
	}
	if (!hideGameOver.value) {
		A(
			"div.popupWrapper",
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
				A("div.popup", () => {
					A("span#Game over! ");
					A("hr");
					A(`span#You took ${previousGuesses.length} guesses`);
					A(`span#Par: ${par}`);

					const shareable = previousGuesses.map(emojiFromGuess).join("\n");
					if (shareable.length > 0) {
						A(`pre#${shareable}`);
					}
					A("div", () => {
						A("label#Include link", () => {
							A("input", {
								type: "checkbox",
								bind: shareLink,
							});
						});
						A("span# ");
						const parText =
							previousGuesses.length === par
								? "on par"
								: previousGuesses.length > par
									? `${previousGuesses.length - par} over par`
									: `${par - previousGuesses.length} under par`;
						A("button#Copy", {
							click() {
								navigator.clipboard.writeText(
									`I got today's Cosmeredle in ${previousGuesses.length}!\n${parText}\n${shareable}${
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

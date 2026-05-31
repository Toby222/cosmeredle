import A from "aberdeen";
import { Footer } from "client/components/Footer";
import { GuessContainer } from "client/components/GuessContainer";
import { MakeGuessContainer } from "client/components/MakeGuessContainer";
import {
	GameOverPopup,
	SettingsPopup,
	SpoilerWarningPopup,
} from "client/components/popups";
import settings from "client/settings";
import type { StoredGuess } from "client/util";
import {
	charactersForToday,
	dateDiff,
	Overlap,
	type OverlapType,
} from "lib/util";

const $previousGuesses = A.proxy([] as StoredGuess[]);
const $availableCharacters = A.proxy(0);
const $answerPending = A.proxy(true);
const $gameInProgress = A.proxy(true);
const $showSettings = A.proxy(true); // TODO: Change to false

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
			$previousGuesses.push(previousGuess);
			if (
				previousGuess.slice(0, 5).every((overlap) => overlap === Overlap.Full)
			) {
				$gameInProgress.value = false;
			}
			$availableCharacters.value--;
		}
	}
	const previousIdxs = $previousGuesses.map((guess) => guess[5]);
	$availableCharacters.value = characters.filter(
		(_character, idx) => !previousIdxs.includes(idx),
	).length;
}
A.derive(() => {
	if ($availableCharacters.value === 0) selectedCharacter.value = undefined;
});
$answerPending.value = false;

async function guess(characterId: number) {
	if ($answerPending.value) return;
	$answerPending.value = true;
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
		$previousGuesses.push([
			...(answer as OverlapType[]),
			characterId,
		] as StoredGuess);
		if (answer.every((overlap) => overlap === Overlap.Full)) {
			$gameInProgress.value = false;
		}
	} else {
		console.error("invalid answer", answer);
	}
	localStorage.setItem("previousGuesses", JSON.stringify($previousGuesses));
	$answerPending.value = false;
}

const $hideGameOver = A.proxy(false);

function makeGuess() {
	if (selectedCharacter.value !== undefined) {
		guess(selectedCharacter.value);
		selectedCharacter.value = undefined;
	}
}

A("main", () => {
	MakeGuessContainer(
		characters,
		$previousGuesses,
		selectedCharacter,
		$gameInProgress,
		$answerPending,
		$showSettings,
		makeGuess,
	);
	A("div", { id: "nextGame" }, () => {
		A(`span#Next game: ${dateDiff(now.value, nextGame, true)}`);
	});
	GuessContainer($previousGuesses);
	SettingsPopup($showSettings);
	GameOverPopup(
		$hideGameOver,
		$gameInProgress,
		settings.shareLink.ref,
		$previousGuesses,
		par,
	);
	SpoilerWarningPopup(settings.spoilerWarningDismissed.ref);
});
Footer();

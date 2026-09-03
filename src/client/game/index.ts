import A from "aberdeen";
import { Footer } from "client/game/components/Footer";
import { GuessContainer } from "client/game/components/GuessContainer";
import { MakeGuessContainer } from "client/game/components/MakeGuessContainer";
import {
	GameOverPopup,
	GiveUpConfirmationPopup,
	LastGamePopup,
	SettingsPopup,
	SpoilerWarningPopup,
} from "client/game/components/popups";
import settings from "client/settings";
import type { StoredGuess } from "client/util";
import {
	type Character,
	charactersForToday,
	dateDiff,
	Overlap,
	type OverlapType,
} from "lib/util";

const GUESSES_TO_HINT = 5;
const GUESSES_TO_GIVE_UP = 10;

const $previousGuesses = A.proxy([] as StoredGuess[]);
const $guessesMade = A.count($previousGuesses);
const $availableCharacters = A.proxy(0);
const $answerPending = A.proxy(true);
const $gameInProgress = A.proxy(true);
const $showSettings = A.proxy(false);
const $showLastGame = A.proxy(false);
const $showGiveup = A.proxy(false);
const $gaveUp = A.proxy(false);
const $selectedCharacter = A.proxy<number | undefined>(undefined);
const $now = A.proxy(Date.now());
setInterval(() => {
	$now.value = Date.now();
}, 1000);

const dates = (await (await fetch("/api/today")).json()) as {
	today: number;
	tomorrow: number;
};
const par = Number.parseInt(await (await fetch("/api/par")).text(), 10);

const nextGame = dates.tomorrow;
if (localStorage.getItem("currentGame") !== dates.today.toString()) {
	localStorage.removeItem("gaveUp");
	localStorage.removeItem("previousGuesses");
	localStorage.setItem("currentGame", dates.today.toString());
}

const characters = charactersForToday();
const $solutionIdx = A.proxy(Number.NaN);
const $solution = A.derive(() => {
	return characters[$solutionIdx.value] as Character | undefined;
});
// Scope to not pollute file scope
{
	$gaveUp.value = localStorage.getItem("gaveUp") === "true";
	A.derive(() => {
		localStorage.setItem("gaveUp", $gaveUp.value.toString());
	});
	if ($gaveUp.value) {
		fetchSolution();
	}

	const previousGuessesStorage = localStorage.getItem("previousGuesses");
	if (previousGuessesStorage !== null) {
		const previousGuessesParsed = JSON.parse(
			previousGuessesStorage,
		) as StoredGuess[];
		for (let idx = 0; idx < previousGuessesParsed.length; idx++) {
			const guess = previousGuessesParsed[idx];
			$previousGuesses.push(guess);
			if (guess.slice(0, 5).every((overlap) => overlap === Overlap.Full)) {
				$gameInProgress.value = false;
				$solutionIdx.value = guess[5];
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
	if ($availableCharacters.value === 0) $selectedCharacter.value = undefined;
});
$answerPending.value = false;

async function guess(characterId: number) {
	if ($answerPending.value) return;
	$answerPending.value = true;
	const answer = await (
		await fetch(`/api/guess/${characterId}`, { method: "POST" })
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
			$solutionIdx.value = characterId;
		}
	} else {
		console.error("invalid answer", answer);
	}
	localStorage.setItem("previousGuesses", JSON.stringify($previousGuesses));
	$answerPending.value = false;
}

const $hideGameOver = A.proxy(false);

function makeGuess() {
	if ($selectedCharacter.value !== undefined) {
		guess($selectedCharacter.value);
		$selectedCharacter.value = undefined;
	}
}

async function giveUp() {
	$showGiveup.value = true;
	await fetchSolution();
}
async function fetchSolution() {
	const solution = (await (await fetch("/api/giveUp")).json()) as number;
	$solutionIdx.value = solution;
}

A.derive(async () => {
	if (!$gaveUp.value) return;

	$gameInProgress.value = false;
});

const $showGameOver = A.derive(() => {
	return !$hideGameOver.value && (!$gameInProgress.value || $gaveUp.value);
});

A("header", () => {
	MakeGuessContainer(
		characters,
		$previousGuesses,
		$selectedCharacter,
		$gameInProgress,
		$answerPending,
		$showSettings,
		makeGuess,
	);
	A("div", { id: "nextGame" }, () => {
		A("button#Last game", {
			click() {
				$showLastGame.value = !$showLastGame.value;
			},
		});
		A("# ");
		A(`span text="Next game:"`, () => {
			A("#", dateDiff($now.value, nextGame, true));
		});
	});
});
A("main", () => {
	GuessContainer($previousGuesses);
	A("div", { id: "popupContainer" }, () => {
		SettingsPopup($showSettings);
		GameOverPopup(
			$showGameOver,
			$hideGameOver,
			$gaveUp,
			settings.shareLink.ref,
			$solution,
			$previousGuesses,
			par,
		);
		LastGamePopup($showLastGame);
		SpoilerWarningPopup(settings.spoilerWarningDismissed.ref);
		GiveUpConfirmationPopup($showGiveup, $gaveUp);
	});

	if (
		!$gaveUp.value &&
		($guessesMade.value >= GUESSES_TO_HINT ||
			$guessesMade.value >= GUESSES_TO_GIVE_UP)
	) {
		A(`span#You've made ${$guessesMade.value} guesses so far.`, {
			id: "guessesMade",
		});
		if ($guessesMade.value >= GUESSES_TO_HINT) {
			A("span#Do you need ", () => {
				A("a#to be reminded of all characters", {
					href: "/characters",
					target: "_blank",
				});
				A("#?");
			});
		}
		if ($guessesMade.value >= GUESSES_TO_GIVE_UP) {
			A("span#Do you want to ", () => {
				A("button#give up", {
					click: giveUp,
				});
				A("#?");
			});
		}
	}
});
Footer();

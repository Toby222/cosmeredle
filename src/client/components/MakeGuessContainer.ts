import A, { type ValueRef } from "aberdeen";
import type { StoredGuess } from "client/util";
import type { Character } from "lib/util";
import { CustomSelectNumber } from "./CustomSelect";

export function MakeGuessContainer(
	characters: Character[],
	guesses: StoredGuess[],
	$selectedIndex: ValueRef<number | undefined>,
	$active: ValueRef<boolean>,
	$pending: ValueRef<boolean>,
	$showSettings: ValueRef<boolean>,
	makeGuess: () => void,
) {
	console.debug("Rerendering MakeGuessContainer");
	return A("div", { id: "makeGuess" }, () => {
		const guessedCharacters = guesses.map((guess) => guess[5]);
		CustomSelectNumber(
			characters.map((character, idx) => ({
				label: character.name.join(" "),
				value: idx,
				disabled: guessedCharacters.includes(idx),
			})),
			$selectedIndex,
			$active,
			makeGuess,
		);

		A("button#Guess", {
			click: makeGuess,
			".disabled": $pending,
		});

		A("button#⚙️", {
			id: "settingsButton",
			click: () => ($showSettings.value = true),
		});
	});
}

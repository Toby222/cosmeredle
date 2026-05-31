import A from "aberdeen";
import type { StoredGuess } from "client/util";
import { GuessBubble } from "./GuessBubble";
import { GuessRow } from "./GuessRow";

export function GuessContainer(guesses: StoredGuess[]) {
	return A("div", { id: "guesses" }, () => {
		A("div", { id: "guessHeader" }, () => {
			A("span.guessTitle#Name");
			A("span.guessTitle#Home World");
			A("span.guessTitle#First Appearance");
			A("span.guessTitle#Species");
			A("span.guessTitle#Abilities/Investiture");
		});
		A.onEach(
			guesses,
			(guess) => GuessRow(guess),
			(_guess, idx) => -idx,
		);
		if (guesses.length === 0) {
			A("div.guessRow", () => {
				GuessBubble("?", "Placeholder");
				GuessBubble("?", "Placeholder");
				GuessBubble("?", "Placeholder");
				GuessBubble("?", "Placeholder");
				GuessBubble("?", "Placeholder");
			});
		}
	});
}

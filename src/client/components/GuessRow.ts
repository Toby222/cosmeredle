import { $ } from "aberdeen";
import type { StoredGuess } from "client/util";
import { charactersForToday } from "lib/util";
import { GuessBubble } from "./GuessBubble";

const characters = charactersForToday();

export function GuessRow(guess: StoredGuess): Element | undefined {
	const guessId = guess[5];
	const speciesArray = characters[guessId].species;
	const species =
		speciesArray[0] +
		(speciesArray.length > 1 ? ` (${speciesArray.slice(1).join(" ")})` : "");
	return $("div.guessRow", () => {
		GuessBubble(characters[guessId].name.join(" "), guess[0]);
		GuessBubble(characters[guessId].homeWorld, guess[1]);
		GuessBubble(characters[guessId].firstAppearance[0], guess[2]);
		GuessBubble(species, guess[3]);
		GuessBubble(characters[guessId].abilities.join(", "), guess[4]);
	});
}

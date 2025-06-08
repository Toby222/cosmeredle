import CHARACTERS from "lib/characters.json";
import { GuessBubble } from "./GuessBubble";
import type { StoredGuess } from "client/util";
import { $ } from "aberdeen";

export function GuessRow(guess: StoredGuess): Element | undefined {
	const guessId = guess[5];
	const speciesArray = CHARACTERS[guessId].species;
	const species = `${speciesArray[0]} (${speciesArray.slice(1).join(" ")})`;
	return $("div.guessRow", () => {
		GuessBubble(CHARACTERS[guessId].name, guess[0]);
		GuessBubble(CHARACTERS[guessId].homeWorld, guess[1]);
		GuessBubble(CHARACTERS[guessId].firstAppearance, guess[2]);
		GuessBubble(species, guess[3]);
		GuessBubble(CHARACTERS[guessId].abilities.join(", "), guess[4]);
	});
}

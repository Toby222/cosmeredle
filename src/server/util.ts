import { playGame } from "lib/solve";
import { type Character, charactersForDay, getCharacterName } from "lib/util";
import { seededRandom } from "./random";

const pars = new Map<number, number>();
const characterForDays: Character[] = [];

function computePar(day: number) {
	const characters = charactersForDay(day);
	const par = 3 + playGame(characters, characterForDay(day), false).length;
	console.debug("par for day", day, "is", par);
	return par;
}
export function getPar(day: number): number {
	return pars.getOrInsertComputed(day, computePar);
}

export function characterForDay(day: number) {
	for (let prevDay = characterForDays.length; prevDay <= day; prevDay++) {
		const characters = charactersForDay(prevDay);

		let index =
			Math.floor(seededRandom(prevDay) * characters.length) % characters.length;
		if (
			prevDay > 0 &&
			getCharacterName(characters[index]) ===
				getCharacterName(characterForDays[prevDay - 1])
		)
			index = (index + 1) % characters.length;

		characterForDays[prevDay] = characters[index];
	}
	if (characterForDays.length < day || !characterForDays[day])
		throw new Error("Something went wrong in character generation");
	return characterForDays[day - 1];
}

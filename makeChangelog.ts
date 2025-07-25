#! /usr/bin/env bun
import {
	charactersMatch,
	daysSinceEpoch,
	charactersForDay,
	type Character,
	formatSpecies,
} from "lib/util";

const from = daysSinceEpoch();
const to = daysSinceEpoch() + 1;
const fromCharacters = charactersForDay(from); //.filter(character => character.name.includes("Ulaam"));
const toCharacters = charactersForDay(to); //.filter(character => character.name.includes("Ulaam"));

const removed = fromCharacters.filter(
	(fromCharacter) =>
		!toCharacters.some((toCharacter) =>
			charactersMatch(fromCharacter, toCharacter),
		),
);
const added = toCharacters.filter(
	(toCharacter) =>
		!fromCharacters.some((fromCharacter) =>
			charactersMatch(fromCharacter, toCharacter),
		),
);

function characterToDiffLine(character: Character) {
	return `${character.name.join(" ")} ; ${character.homeWorld} ; ${character.firstAppearance} ; ${formatSpecies(character.species)} ; ${character.abilities.join(", ")}`;
}

const removedString = removed.map(
	(character) => `- ${characterToDiffLine(character)}`,
);
const addedString = added.map(
	(character) => `+ ${characterToDiffLine(character)}`,
);
const changeLog = [...removedString, ...addedString]
	.sort((a, b) => a.slice(2).localeCompare(b.slice(2)))
	.join("\n");

await Bun.file("changelog.diff").write(changeLog);

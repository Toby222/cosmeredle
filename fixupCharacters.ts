#! /usr/bin/env bun
import { $ } from "bun";
import CHARACTERS from "lib/characters.json";
import type { Character } from "lib/util";

const newCharacters: Character[] = [];

for (const character of CHARACTERS) {
	newCharacters.push({
		name: character.name,
		homeWorld: character.homeWorld,
		firstAppearance: character.firstAppearance,
		species: character.species,
		abilities: character.abilities
			.filter((ability, idx, abilities) => abilities.indexOf(ability) === idx)
			.sort(),
		validFrom: character.validFrom,
		validUntil: character.validUntil,
	});
}

Bun.file("./src/lib/characters.json").write(
	JSON.stringify(newCharacters, null, 2),
);
for await (const line of $`nix fmt`.lines()) {
	console.log(line);
}

#! /usr/bin/env bun
import CHARACTERS from "lib/characters.json";
import type { Character } from "lib/util";

function toCSV(character: Character): string {
	try {
		let line = "";

		if (character.name.length > 1) line += `"${character.name.join(", ")}"`;
		else line += character.name[0];

		line += `,${character.homeWorld},"${character.firstAppearance[0]},${character.firstAppearance[1]}",`;

		if (character.species.length > 1)
			line += `"${character.species[0]} (${character.species[1]})"`;
		else if (character.species[0].includes(" "))
			line += `"${character.species[0]}"`;
		else line += character.species[0];

		line += ",";

		if (character.abilities.length > 1)
			line += `"${character.abilities.join(",")}"`;
		else if (character.abilities[0].includes(" "))
			line += `"${character.abilities[0]}"`;
		else line += character.abilities[0];

		line += `${character.validFrom},${character.validUntil ?? "now"}`;

		return line;
	} catch (e) {
		console.error(character, e);
		throw e;
	}
}

const characterCSV = [
	{
		name: ["Name"],
		homeWorld: '"Home World"',
		firstAppearance: "First Appearance",
		species: ["Species"],
		abilities: ["Abilities"],
		validFrom: '"Valid From"',
		validUntil: '"Valid Until"',
	} as unknown as Character,
	...CHARACTERS,
]
	.map(toCSV)
	.join("\n");

await Bun.file("./export.csv").write(characterCSV);

#! /usr/bin/env bun
import { $ } from "bun";
import CHARACTERS from "lib/characters.json";
import {
	compareCharacters,
	Overlap,
	daysSinceEpoch,
	type Character,
} from "lib/util";

const characterCSV = await Bun.file("./cosmeredle.csv").text();
const characters = characterCSV
	.split("\n")
	.slice(1)
	.map((line): Character => {
		const [name, homeWorld, firstAppearance, speciesRaw, ...abilitiesRaw] =
			line.split(",");
		const speciesGroup = speciesRaw.match(
			/(?<species>[^(]+) \((?<subspecies>[^)]+)\)/,
		)?.groups;
		if (speciesGroup === undefined) throw new Error("Species match fail");
		return {
			name: name.split(" "),
			homeWorld,
			firstAppearance,
			species: [speciesGroup.species, speciesGroup.subspecies],
			abilities: abilitiesRaw
				.join(",")
				.replace(/^"/, "")
				.replace(/"$/, "")
				.split(", ")
				.sort(),
			validFrom: daysSinceEpoch() + 1,
			validUntil: undefined,
		};
	});

const differentCharacters = characters.filter(
	(csvCharacter) =>
		!CHARACTERS.some((jsonCharacter) =>
			compareCharacters(csvCharacter, jsonCharacter).every(
				(overlap) => overlap === Overlap.Full,
			),
		),
);
console.debug(differentCharacters, differentCharacters.length);
await Bun.file("differences.json").write(
	JSON.stringify(differentCharacters, null, 2),
);

for await (const line of $`nix fmt`.lines()) {
	console.log(line);
}

#! /usr/bin/env bun
import { $ } from "bun";
import CHARACTERS from "lib/characters.json";
import { type Character, compareName, daysSinceEpoch, Overlap } from "lib/util";

function makeWarning(text: string) {
	return (
		"\u001b[33m" + // set color to yellow
		text +
		"\u001b[39m" // reset color
	);
}

async function readLine(prompt?: string): Promise<string> {
	if (prompt) process.stdout.write(prompt);
	for await (const line of console) {
		return line.trim();
	}
	return "";
}

const newCharacters: Character[] = [];
while (true) {
	const newCharacter: Character = {
		name: (await readLine("Name: ")).split(" "),
		homeWorld: await readLine("Home world: "),
		firstAppearance: await readLine("First appearance: "),
		species: (await readLine("Species (comma-separated race): "))
			.split(",")
			.map((x) => x.trim()),
		abilities: (await readLine("Abilities: "))
			.split(",")
			.map((x) => x.trim())
			.sort(),
		validFrom: daysSinceEpoch() + 1,
	};

	const existingCharacter = CHARACTERS.find(
		(char) =>
			compareName(char.name, newCharacter.name) === Overlap.Full &&
			(char.validUntil === undefined || char.validUntil > daysSinceEpoch()),
	);
	console.debug(existingCharacter, "existingCharacter");

	if (existingCharacter !== undefined) {
		console.debug("Character exists");
		if (
			(
				await readLine(
					makeWarning(
						"Character already exists. Update existing one starting tomorrow? [y/N] ",
					),
				)
			)
				.toLowerCase()
				.startsWith("y")
		) {
			existingCharacter.validUntil = daysSinceEpoch();
			newCharacters.push(newCharacter);
		}
	} else {
		newCharacters.push(newCharacter);
	}

	if (
		!(await readLine("Another character? [y/N] ")).toLowerCase().startsWith("y")
	) {
		break;
	}
}

Bun.file("./src/lib/characters.json").write(
	JSON.stringify([...CHARACTERS, ...newCharacters], null, 2),
);
for await (const line of $`nix fmt`.lines()) {
	console.log(line);
}

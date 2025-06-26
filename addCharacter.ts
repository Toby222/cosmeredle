import { $ } from "bun";
import CHARACTERS from "lib/characters.json";
import { type Character, daysSinceEpoch } from "lib/util";

async function readLine(prompt?: string): Promise<string> {
	if (prompt) process.stdout.write(prompt);
	for await (const line of console) {
		return line.trim();
	}
	return "";
}

const newCharacters: Character[] = [];
while (true) {
	newCharacters.push({
		name: await readLine("Name: "),
		homeWorld: await readLine("Home world: "),
		firstAppearance: await readLine("First appearance: "),
		species: (await readLine("Species (comma-separated race): "))
			.split(",")
			.map((x) => x.trim()),
		abilities: (await readLine("Abilities: ")).split(",").map((x) => x.trim()),
		validFrom: daysSinceEpoch() + 1,
		id: CHARACTERS.length + newCharacters.length,
	});

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

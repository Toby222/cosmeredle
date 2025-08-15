#! /usr/bin/env bun
import { charactersForToday } from "lib/util";

for (const character of charactersForToday().sort((a, b) =>
	a.name.join(" ").localeCompare(b.name.join(" ")),
)) {
	const wrongAbilities = new Set([
		"Shardbearer",
		"Uninvested",
		"Yoki-Hijo",
		"Cognitive Shadow",
		"Sprouter",
		"Mistborn",
		"Hemalurgy",
		"Shard Vessel",
	]);
	const wrongRace = new Set([
		"Alethi",
		"Unspecified",
		"Teo",
		"Diggen's Point",
		"Skaa",
	]);
	const wrongBooks = new Set([
		"Warbreaker",
		"Elantris",
		"Tress of the Emerald Sea",
		"The Final Empire",
		"The Well of Ascension",
		"Words of Radiance",
		"The Way of Kings",
		"Yumi and the Nightmare Painter",
		"The Emperor's Soul",
	]);
	if (
		character.species[0] === "Human" &&
		!wrongRace.has(character.species[1]) &&
		wrongAbilities.isDisjointFrom(new Set(character.abilities)) &&
		character.abilities.includes("Worldhopper") &&
		!wrongBooks.has(character.firstAppearance[0])
	)
		console.debug(character.name.join(" "));
}

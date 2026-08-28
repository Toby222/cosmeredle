import { A } from "aberdeen";
import { Footer } from "client/game/components/Footer";
import { GuessBubble } from "client/game/components/GuessBubble";
import { MS_PER_DAY } from "lib/util";
import type { ChangeRequest } from "server/database";

const idString = location.pathname.replace(/^\/changes\//, "");
const id = Number.parseInt(idString, 10);
const validId = Number.isSafeInteger(id);

const character = validId
	? ((await (await fetch(`/api/changes/${idString}`)).json()) as
			| (ChangeRequest & { rowid: number })
			| { error: string })
	: null;

A("header#Cosmeredle Changes");
A("main", async () => {
	if (!validId) {
		A("span#INVALID ID AAA");
	} else if (!character) {
		A("span#REQUEST NOT FOUND AAA");
	} else if ("error" in character) {
		A("span#", character.error);
	} else {
		A("div.guessRow", () => {
			GuessBubble(character.characterName, "Full");
			GuessBubble(character.homeWorld, "Full");
			GuessBubble(character.firstAppearance, "Full");
			GuessBubble(character.species, "Full");
			GuessBubble(character.abilities, "Full");
		});
		A(
			"div#Change #" +
				id +
				" requested on " +
				Intl.DateTimeFormat("en-CA").format(
					new Date(character.day * MS_PER_DAY),
				),
		);
		if (character.replaces) {
			A(`div#Intended to replace existing entry for ${character.replaces}`);
		}
	}
});
Footer();

import CHARACTERS from "assets/characters.html";
import GAME from "assets/game.html";
import {
	charactersForDay,
	compareCharacters,
	daysSinceEpoch,
	MS_PER_DAY,
} from "lib/util";
import { characterForDay, getPar } from "server/util";

let today = 0;

function nextDay() {
	today = daysSinceEpoch();

	console.info(
		"Updating today to",
		today,
		"; today's character is",
		characterForDay(today).name.join(" "),
	);
}

function updateToday(): boolean {
	if (today === daysSinceEpoch()) return false;
	while (today < daysSinceEpoch()) {
		nextDay();
	}
	return true;
}

updateToday();
setInterval(() => {
	updateToday();
}, 1_000);

const PORT = 45065;

console.info("listening on port", PORT);
Bun.serve({
	port: PORT,
	fetch: async (request) => {
		console.debug(request);
		return Response.redirect("/", 301);
	},
	routes: {
		"/": GAME,
		"/characters.html": CHARACTERS,
		"/guess/:characterIdx": {
			async POST(request) {
				const { characterIdx } = request.params;
				if (!/\d+/.test(characterIdx)) return Response.error();
				const characters = charactersForDay(today);
				const char = characters[Number.parseInt(characterIdx, 10)];

				return Response.json(compareCharacters(char, characterForDay(today)));
			},
		},
		"/guess/:characterIdx/:day": {
			async POST(request) {
				const { characterIdx, day } = request.params;
				if (!/\d+/.test(characterIdx)) return Response.error();
				if (!/\d+/.test(day)) return Response.error();
				const characters = charactersForDay(Number.parseInt(day, 10));
				const char = characters[Number.parseInt(characterIdx, 10)];

				return Response.json(
					compareCharacters(char, characterForDay(Number.parseInt(day, 10))),
				);
			},
		},
		"/today": async () =>
			Response.json({
				today: today,
				tomorrow: (today + 1) * MS_PER_DAY,
			}),
		"/par": async () =>
			new Response(getPar(today).toString(), {
				headers: { "Content-Type": "text/plain" },
			}),
		"/par/:day": async (request) =>
			/\d+/.test(request.params.day)
				? new Response(
						getPar(Number.parseInt(request.params.day, 10)).toString(),
						{
							headers: { "Content-Type": "text/plain" },
						},
					)
				: Response.error(),
		"/characters": async () => Response.json(charactersForDay(today)),
		"/characters/:day": async (request) => {
			const { day } = request.params;
			if (!/\d+/.test(day)) return Response.error();
			return Response.json(charactersForDay(Number.parseInt(day, 10)));
		},
	},
});

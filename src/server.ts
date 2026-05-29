import INDEX from "assets/index.html";
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
		"/": INDEX,
		"/guess/:characterIdx": {
			async POST(request) {
				const { characterIdx } = request.params;
				if (!/\d+/.test(characterIdx)) return Response.error();
				const characters = charactersForDay(today);
				const char = characters[Number.parseInt(characterIdx, 10)];

				return new Response(
					JSON.stringify(compareCharacters(char, characterForDay(today))),
					{ headers: { "Content-Type": "application/json" } },
				);
			},
		},
		"/guess/:characterIdx/:day": {
			async POST(request) {
				const { characterIdx, day } = request.params;
				if (!/\d+/.test(characterIdx)) return Response.error();
				if (!/\d+/.test(day)) return Response.error();
				const characters = charactersForDay(Number.parseInt(day, 10));
				const char = characters[Number.parseInt(characterIdx, 10)];

				return new Response(
					JSON.stringify(
						compareCharacters(char, characterForDay(Number.parseInt(day, 10))),
					),
					{ headers: { "Content-Type": "application/json" } },
				);
			},
		},
		"/today": async () =>
			new Response(
				JSON.stringify({
					today: today,
					tomorrow: (today + 1) * MS_PER_DAY,
				}),
				{ headers: { "Content-Type": "application/json" } },
			),
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
		"/characters": async () =>
			new Response(JSON.stringify(charactersForDay(today)), {
				headers: { "Content-Type": "application/json" },
			}),
		"/characters/:day": async (request) => {
			const { day } = request.params;
			if (!/\d+/.test(day)) return Response.error();
			return new Response(
				JSON.stringify(charactersForDay(Number.parseInt(day, 10))),
				{
					headers: { "Content-Type": "application/json" },
				},
			);
		},
	},
});

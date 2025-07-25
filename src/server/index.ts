import {
	type Character,
	charactersForDay,
	compareCharacters,
	daysSinceEpoch,
	MS_PER_DAY,
	Overlap,
} from "lib/util";
import { createSimpleLogger, type STANDARD_LEVELS } from "simple-node-logger";

import BACKGROUND from "../../public/bg.gif" with { type: "file" };
import FAVICON from "../../public/favicon.svg" with { type: "text" };
import INDEX from "../../public/index.html" with { type: "text" };
import INDEX_JS from "../../public/js/index.js" with { type: "text" };
import INDEX_JS_MAP from "../../public/js/index.js.map" with { type: "text" };
import STYLE from "../../public/style.css" with { type: "text" };

import { seededRandom } from "./random";

const logLevel = Bun.env.LOG_LEVEL;
const logToFile = Bun.env.LOG_TO_FILE === "true";

type LoggerConfig = Parameters<typeof createSimpleLogger>[number];

const loggerConfig: LoggerConfig = {
	timestampFormat: "YYYY-MM-DDTHH:mm:ss",
};

if (logToFile) {
	loggerConfig.logFilePath = "cosmeredle.log";
}
if (
	logLevel !== undefined &&
	["all", "trace", "debug", "info", "warn", "error", "fatal"].includes(logLevel)
) {
	loggerConfig.level = logLevel as STANDARD_LEVELS;
} else {
	loggerConfig.level = "info";
}

let todaysCharacterIndex = 0;
let today = 0;

function nextDay() {
	const yesterday = today;
	const charactersYesterday = charactersForDay(yesterday);
	const yesterdaysCharacterName =
		charactersYesterday[todaysCharacterIndex]?.name;

	today++;

	const characters = charactersForDay(today);
	todaysCharacterIndex = Math.floor(seededRandom() * characters.length);

	if (characters[todaysCharacterIndex].name === yesterdaysCharacterName) {
		todaysCharacterIndex = (todaysCharacterIndex + 1) % characters.length;
	}

	console.debug(
		"Updating today to",
		today,
		"; today's character is",
		characters[todaysCharacterIndex].name,
	);
}

function updateToday() {
	while (today < daysSinceEpoch()) {
		nextDay();
	}
}

updateToday();
setInterval(updateToday, 1_000);

const log = createSimpleLogger(loggerConfig);

const PORT = 45065;

log.info("listening on port ", PORT);
Bun.serve({
	port: PORT,
	fetch: (request) => {
		console.debug(request);
		return Response.redirect("/", 301);
	},
	routes: {
		"/favicon.ico": () => new Response(null, { status: 404 }),
		"/bg.gif": () => new Response(Bun.file(BACKGROUND)),
		"/": () =>
			new Response(INDEX, {
				headers: { "Content-Type": "text/html" },
			}),
		"/style.css": () =>
			new Response(STYLE, {
				headers: { "Content-Type": "text/css" },
			}),
		"/favicon.svg": () =>
			new Response(FAVICON, {
				headers: { "Content-Type": "image/svg+xml" },
			}),
		"/js/index.js": () =>
			new Response(INDEX_JS, {
				headers: {
					"Content-Type": "text/javascript",
					SourceMap: "/js/index.js.map",
				},
			}),
		"/js/index.js.map": () =>
			new Response(INDEX_JS_MAP, {
				headers: { "Content-Type": "application/json" },
			}),
		"/guess/:characterIdx": {
			async POST(request) {
				const { characterIdx } = request.params;
				if (!/\d+/.test(characterIdx)) return Response.error();
				const characters = charactersForDay(today);
				const char = characters[Number.parseInt(characterIdx, 10)];

				return new Response(
					JSON.stringify(
						compareCharacters(char, characters[todaysCharacterIndex]),
					),
					{
						headers: { "Content-Type": "application/json" },
					},
				);
			},
		},
		"/today": () =>
			new Response(
				JSON.stringify({
					today: today,
					tomorrow: (today + 1) * MS_PER_DAY,
				}),
				{
					headers: { "Content-Type": "application/json" },
				},
			),
		"/characters": () =>
			new Response(JSON.stringify(charactersForDay(today)), {
				headers: { "Content-Type": "application/json" },
			}),
	},
});

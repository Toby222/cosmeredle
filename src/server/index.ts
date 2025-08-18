import { playGame } from "lib/solve";
import {
	charactersForDay,
	compareCharacters,
	daysSinceEpoch,
	MS_PER_DAY,
} from "lib/util";
import { createSimpleLogger, type STANDARD_LEVELS } from "simple-node-logger";
import {
	APPLE_TOUCH_ICON,
	BACKGROUND,
	FAVICON_96,
	FAVICON_ICO,
	FAVICON_SVG,
	INDEX,
	INDEX_JS,
	INDEX_JS_MAP,
	STYLE,
	WEB_APP_MANIFEST_192,
	WEB_APP_MANIFEST_512,
} from "./public_files";
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

const log = createSimpleLogger(loggerConfig);

let todaysCharacterIndex = 0;
let today = 0;
let par = 0;

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
		characters[todaysCharacterIndex].name.join(" "),
	);
}
function setPar() {
	const characters = charactersForDay(today);
	par = playGame(characters, characters[todaysCharacterIndex], false).length;
}

function updateToday(): boolean {
	if (today === daysSinceEpoch()) return false;
	while (today < daysSinceEpoch()) {
		nextDay();
	}
	return true;
}

updateToday();
setPar();

console.debug("par is", par);
setInterval(() => {
	if (updateToday()) setPar();
}, 1_000);

const PORT = 45065;

log.info("listening on port ", PORT);
Bun.serve({
	port: PORT,
	fetch: (request) => {
		console.debug(request);
		return Response.redirect("/", 301);
	},
	routes: {
		"/bg.gif": () => new Response(Bun.file(BACKGROUND)),
		"/": () => new Response(Bun.file(INDEX)),
		"/style.css": () => new Response(Bun.file(STYLE)),
		"/apple-touch-icon.png": () => new Response(Bun.file(APPLE_TOUCH_ICON)),
		"/favicon.svg": () => new Response(Bun.file(FAVICON_SVG)),
		"/favicon.ico": () => new Response(Bun.file(FAVICON_ICO)),
		"/favicon-96x96.png": () => new Response(Bun.file(FAVICON_96)),
		"/js/index.js": () => new Response(Bun.file(INDEX_JS)),
		"/js/index.js.map": () => new Response(Bun.file(INDEX_JS_MAP)),
		"/web-app-manifest-192x192.png": () =>
			new Response(Bun.file(WEB_APP_MANIFEST_192)),
		"/web-app-manifest-512x512.png": () =>
			new Response(Bun.file(WEB_APP_MANIFEST_512)),
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
					{ headers: { "Content-Type": "application/json" } },
				);
			},
		},
		"/today": () =>
			new Response(
				JSON.stringify({
					today: today,
					tomorrow: (today + 1) * MS_PER_DAY,
				}),
				{ headers: { "Content-Type": "application/json" } },
			),
		"/par": () =>
			new Response(par.toString(), {
				headers: { "Content-Type": "text/plain" },
			}),
		"/characters": () =>
			new Response(JSON.stringify(charactersForDay(today)), {
				headers: { "Content-Type": "application/json" },
			}),
	},
});

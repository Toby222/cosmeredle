import A from "aberdeen";

const settings = {
	shareLink: {
		ref: A.proxy(localStorage.getItem("shareLink") === "true"),
		default: false,
	},
	fontSize: {
		ref: A.proxy(Number.parseFloat(localStorage.getItem("fontSize") ?? "2.5")),
		default: 2.5,
		min: 1.5,
		max: 5,
	},
	spoilerWarningDismissed: {
		ref: A.proxy(localStorage.getItem("spoilerWarningDismissed") === "true"),
		default: false,
	},
	colorOverlapFull: {
		ref: A.proxy(
			JSON.parse(
				localStorage.getItem("colorOverlapFull") ?? '"green"',
			) as string,
		),
		default: "green",
	},
	colorOverlapPartial: {
		ref: A.proxy(
			JSON.parse(
				localStorage.getItem("colorOverlapPartial") ?? '"yellow"',
			) as string,
		),
		default: "yellow",
	},
	colorOverlapNone: {
		ref: A.proxy(
			JSON.parse(localStorage.getItem("colorOverlapNone") ?? '"red"') as string,
		),
		default: "red",
	},
	colorOverlapPlaceholder: {
		ref: A.proxy(
			JSON.parse(
				localStorage.getItem("colorOverlapPlaceholder") ?? '"#444"',
			) as string,
		),
		default: "#444",
	},
	emojiOverlapFull: {
		ref: A.proxy(
			JSON.parse(localStorage.getItem("emojiOverlapFull") ?? '"🟩"') as string,
		),
		default: "🟩",
	},
	emojiOverlapPartial: {
		ref: A.proxy(
			JSON.parse(
				localStorage.getItem("emojiOverlapPartial") ?? '"🟨"',
			) as string,
		),
		default: "🟨",
	},
	emojiOverlapNone: {
		ref: A.proxy(
			JSON.parse(localStorage.getItem("emojiOverlapNone") ?? '"🟥"') as string,
		),
		default: "🟥",
	},
} as const;

A.peek(() => {
	if (settings.emojiOverlapFull.ref.value.length !== 1) {
		settings.emojiOverlapFull.ref.value = settings.emojiOverlapFull.default;
	}
	if (settings.emojiOverlapPartial.ref.value.length !== 1) {
		settings.emojiOverlapPartial.ref.value =
			settings.emojiOverlapPartial.default;
	}
	if (settings.emojiOverlapNone.ref.value.length !== 1) {
		settings.emojiOverlapNone.ref.value = settings.emojiOverlapNone.default;
	}
});

A.derive(() => {
	document.documentElement.style.setProperty(
		"--overlap-full",
		settings.colorOverlapFull.ref.value,
	);
});
A.derive(() => {
	document.documentElement.style.setProperty(
		"--overlap-partial",
		settings.colorOverlapPartial.ref.value,
	);
});
A.derive(() => {
	document.documentElement.style.setProperty(
		"--overlap-none",
		settings.colorOverlapNone.ref.value,
	);
});
A.derive(() => {
	document.documentElement.style.setProperty(
		"--overlap-placeholder",
		settings.colorOverlapPlaceholder.ref.value,
	);
});
A.derive(() => {
	if (settings.fontSize.ref.value < settings.fontSize.min) {
		settings.fontSize.ref.value = settings.fontSize.min;
	} else if (settings.fontSize.ref.value > settings.fontSize.max) {
		settings.fontSize.ref.value = settings.fontSize.max;
	}
	document.documentElement.style.setProperty(
		"--font-size-base",
		`calc(${settings.fontSize.ref.value} * var(--base-unit)`,
	);
});

for (const [
	settingName,
	{ ref: setting, default: defaultValue },
] of Object.entries(settings)) {
	A.derive(() => {
		console.debug(
			"Updating setting",
			settingName,
			"with value",
			setting.value,
			`(${typeof setting.value})`,
		);
		if (
			typeof setting.value !== typeof defaultValue ||
			Number.isNaN(setting.value)
		)
			setting.value = defaultValue;
		if (setting.value === undefined || setting.value === defaultValue)
			localStorage.removeItem(settingName);
		else localStorage.setItem(settingName, JSON.stringify(setting.value));
	});
}

export default settings;

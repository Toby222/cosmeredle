import A, { type ValueRef } from "aberdeen";

import settings from "client/settings";

export function SettingsPopup($visible: ValueRef<boolean>) {
	if (!$visible.value) return;

	A(
		"div.popupWrapper",
		{
			id: "settings",
			click(event: MouseEvent) {
				if (event.target === this) $visible.value = false;
			},
		},
		() => {
			A("div.popup", () => {
				A("h1#Settings ⚙️");
				A("hr");
				A("label#Include link in share", () => {
					A("input", {
						type: "checkbox",
						bind: settings.shareLink.ref,
					});
				});

				A("hr");
				A("h2#Colors", () => {
					A("button#↺", {
						id: "resetColors",
						title: "Reset to default",
						click() {
							A.peek(() => {
								settings.colorOverlapFull.ref.value =
									settings.colorOverlapFull.default;
								settings.colorOverlapPartial.ref.value =
									settings.colorOverlapPartial.default;
								settings.colorOverlapNone.ref.value =
									settings.colorOverlapNone.default;
								settings.colorOverlapPlaceholder.ref.value =
									settings.colorOverlapPlaceholder.default;
							});
						},
					});
				});
				A("hr");
				A("label#Full overlap", () => {
					A("input", {
						type: "color",
						bind: settings.colorOverlapFull.ref,
					});
				});
				A("label#Partial overlap", () => {
					A("input", {
						type: "color",
						bind: settings.colorOverlapPartial.ref,
					});
				});
				A("label#No overlap", () => {
					A("input", {
						type: "color",
						bind: settings.colorOverlapNone.ref,
					});
				});
				A("label#Guess placeholder", () => {
					A("input", {
						type: "color",
						bind: settings.colorOverlapPlaceholder.ref,
					});
				});

				A("hr");
				A("h2#Share symbols", () => {
					A("button#↺", {
						id: "resetEmoji",
						title: "Reset to default",
						click() {
							A.peek(() => {
								settings.emojiOverlapFull.ref.value =
									settings.emojiOverlapFull.default;
								settings.emojiOverlapPartial.ref.value =
									settings.emojiOverlapPartial.default;
								settings.emojiOverlapNone.ref.value =
									settings.emojiOverlapNone.default;
							});
						},
					});
				});
				A("hr");
				A("label#Full overlap", () => {
					A("input", {
						type: "text",
						maxLength: 1,
						bind: settings.emojiOverlapFull.ref,
					});
				});
				A("label#Partial overlap", () => {
					A("input", {
						type: "text",
						maxLength: 1,
						bind: settings.emojiOverlapPartial.ref,
					});
				});
				A("label#No overlap", () => {
					A("input", {
						type: "text",
						maxLength: 1,
						bind: settings.emojiOverlapNone.ref,
					});
				});
			});
		},
	);
	return A();
}

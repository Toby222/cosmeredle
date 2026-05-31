import A, { type ValueRef } from "aberdeen";
import { emojiFromGuess, type StoredGuess } from "client/util";

export function GameOverPopup(
	$dismissed: ValueRef<boolean>,
	$hide: ValueRef<boolean>,
	$includeLink: ValueRef<boolean>,
	guesses: StoredGuess[],
	par: number,
): Element | undefined {
	if ($dismissed.value) return;
	return A(
		"div.popupWrapper",
		{
			id: "gameOver",
			".hidden": $hide,
			click(event: MouseEvent) {
				if (event.target === this) {
					$dismissed.value = true;
				}
			},
		},
		() => {
			A("div.popup", () => {
				A("span#Game over! ");
				A("hr");
				A(`span#You took ${guesses.length} guesses`);
				A(`span#Par: ${par}`);

				const shareable = A.derive(() =>
					guesses.map(emojiFromGuess).join("\n"),
				);
				if (shareable.value.length > 0) {
					A(`pre#${shareable.value}`);
				}
				A("div", () => {
					A("label#Include link", () => {
						A("input", {
							type: "checkbox",
							bind: $includeLink,
						});
					});
					A("span# ");
					const parText =
						guesses.length === par
							? "on par"
							: guesses.length > par
								? `${guesses.length - par} over par`
								: `${par - guesses.length} under par`;
					A("button#Copy", {
						click() {
							navigator.clipboard.writeText(
								`I got today's Cosmeredle in ${guesses.length}!\n${parText}\n${shareable}${
									$includeLink.value ? `\n${location.href}` : ""
								}`,
							);
						},
					});
				});
			});
		},
	);
}

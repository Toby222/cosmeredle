import A, { type ValueRef } from "aberdeen";
import { emojiFromGuess, type StoredGuess } from "client/util";
import type { Character } from "lib/util";

export function GameOverPopup(
	$visible: ValueRef<boolean>,
	$dismissed: ValueRef<boolean>,
	$gaveUp: ValueRef<boolean>,
	$includeLink: ValueRef<boolean>,
	$solution: ValueRef<Character | undefined>,
	guesses: StoredGuess[],
	par: number,
): Element | undefined {
	if (!$visible.value || $dismissed.value) return;
	return A(
		"div.popupWrapper",
		{
			id: "gameOver",
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
				if ($solution.value) {
					A("span#The correct character was: ", () => {
						A(`#${$solution.value?.name.join(" ")}`);
					});
				}
				A("hr");
				A(
					`span#You ${$gaveUp.value ? "gave up" : "won"} ${guesses.length} after guesses`,
				);
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
								`I ${A.unproxy($gaveUp.value) ? "lost" : "won"} today's Cosmeredle in ${guesses.length}!\n${parText}\n${shareable.value}${
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

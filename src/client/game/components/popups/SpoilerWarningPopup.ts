import A, { type ValueRef } from "aberdeen";

export function SpoilerWarningPopup($dismissed: ValueRef<boolean>) {
	if ($dismissed.value) return;
	return A(
		"div.popupWrapper",
		{
			id: "spoilerWarning",
			click() {
				$dismissed.value = true;
			},
		},
		() => {
			A("div.popup", () => {
				A("span#Spoiler warning!");
				A("hr");
				A("span", () => {
					A("#This game contains spoilers for ");
					A("em color:red fontStyle:cursive #all");
					A("# of the Cosmere!");
				});
				A(
					"span#Do not continue unless you're caught-up with all books or don't mind potentially getting spoiled.",
				);
				A("span#click/tap to close this notice, it will not be shown again");
			});
		},
	);
}

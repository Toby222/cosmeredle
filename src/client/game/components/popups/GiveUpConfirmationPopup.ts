import A, { type ValueRef } from "aberdeen";

export function GiveUpConfirmationPopup(
	$visible: ValueRef<boolean>,
	$giveUp: ValueRef<boolean>,
) {
	if (!$visible.value) return;
	return A(
		"div.popupWrapper",
		{
			id: "spoilerWarning",
			click() {
				$visible.value = false;
			},
		},
		() => {
			A("div.popup", () => {
				A("h3#Are you sure you want to give up?");
				A("hr");
				A("span display:flex justify-content:space-between width:100%", () => {
					A(
						"button padding:0.5em font-weight:bold color:red fontStyle:cursive #Yes",
						{
							click() {
								$giveUp.value = true;
								$visible.value = false;
							},
						},
					);
					A("button padding:0.5em #No", {
						click() {
							$visible.value = false;
						},
					});
				});
			});
		},
	);
}

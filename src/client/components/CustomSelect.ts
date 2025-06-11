import { $, onEach, proxy, type ValueRef } from "aberdeen";

// TODO: Select with arrow keys

export type Entry<T> = {
	label: string;
	value: T;
	disabled: boolean;
};

export function CustomSelectNumber(
	entries: Entry<number>[],
	valueProxy: ValueRef<number | undefined>,
	enabled: ValueRef<boolean>,
): HTMLDivElement | undefined {
	const search = proxy("");
	const visible = proxy(false);

	return $(
		"div.customSelect",
		{
			".opened": visible,
			".enabled": enabled,
		},
		() => {
			$("div.input", () => {
				$("input", {
					type: "text",
					placeholder: "Search",
					bind: search,
					input() {
						if (enabled.value && search.value.length > 0 && !visible.value) {
							visible.value = true;
						}
					},
					click() {
						visible.value = enabled.value && !visible.value;
					},
					disabled: enabled.value ? undefined : true,
				});
				$("button:Clear", {
					click() {
						search.value = "";
					},
				});
			});
			$("ul", () => {
				onEach(entries, (entry, index) => {
					$(`li:${entry.label}`, {
						click(event: MouseEvent) {
							if (event.target === this) {
								event.stopPropagation();
								if (!(this as HTMLLIElement).classList.contains("disabled")) {
									valueProxy.value = entry.value;
									search.value = entry.label;
									visible.value = false;
								}
							}
						},
						".disabled": entry.disabled,
						".hidden": !entry.label
							.toLowerCase()
							.includes(search.value.toLowerCase()),
					});
				});
			});
		},
	) as HTMLDivElement | undefined;
}

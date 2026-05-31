import A from "aberdeen";

export function Footer() {
	return A("footer", () => {
		A("span.footerItem", () => {
			A("#Contact: ");
			A("a#cosmeredle@tobot.dev", { href: "mailto:cosmeredle@tobot.dev" });
		});
		A("span.footerItem", () => {
			A("#All Cosmere characters belong to ");
			A("a#Brandon Sanderson", { href: "https://www.brandonsanderson.com/" });
			A("#/");
			A("a#Dragonsteel", { href: "https://www.dragonsteelbooks.com/" });
		});
	});
}

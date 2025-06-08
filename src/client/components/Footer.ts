import { $ } from "aberdeen";

export function Footer() {
	$("footer", () => {
		$("span.footerItem", () => {
			$(":Contact: ");
			$("a:cosmeredle@tobot.dev", { href: "mailto:cosmeredle@tobot.dev" });
		});
		$("span.footerItem", () => {
			$(":All Cosmere characters belong to ");
			$("a:Brandon Sanderson", { href: "https://www.brandonsanderson.com/" });
			$(":/");
			$("a:Dragonsteel", { href: "https://www.dragonsteelbooks.com/" });
		});
	});
}

import "bun";

await Bun.build({
	entrypoints: ["./src/server/index.ts"],
	compile: {
		outfile: "./cosmeredle",
		autoloadBunfig: false,
		autoloadDotenv: false,
		autoloadPackageJson: false,
		autoloadTsconfig: false,
	},
	bytecode: true,
	target: "bun",
	format: "esm",
});

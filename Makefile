DEBUG=

# Tell make to ignore existing folders and allow overwriting existing files
.PHONY: modules literal

# Must format with tabs not spaces
literal:
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run --unstable ./deno/make-literal.js ./ debug

comments:
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run --unstable ./deno/make-comments.js ./modules/ ./stuff/ ./docs/includes/page.literal debug

modules:
	rm -rf ./build
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run ../fn/deno/make-modules.js build module.js
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run ../fn/deno/make-modules.js build literal-include.js literal-include.css
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run ../fn/deno/make-modules.js build literal-element.js
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run ../fn/deno/make-modules.js build literal.js literal.css

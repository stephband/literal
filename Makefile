DEBUG=

# Tell make to ignore existing folders and allow overwriting existing files
.PHONY: modules literal comments documentation

# Must format with tabs not spaces
literal:
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run --unstable ./deno/make-literal.js ./ debug

comments:
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run --unstable ./deno/make-comments.js ./modules/ ./stuff/ ./documentation/templates/page.literal debug

modules:
	rm -rf ./build
	#deno run --allow-read --allow-env --allow-net --allow-write --allow-run ../fn/deno/make-modules.js build
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run ../fn/deno/make-modules.js build module.js literal-element/module.js literal-include/module.js literal-include/module.css
	#deno run --allow-read --allow-env --allow-net --allow-write --allow-run ../fn/deno/make-modules.js build literal-element/module.js
	#deno run --allow-read --allow-env --allow-net --allow-write --allow-run ../fn/deno/make-modules.js build literal.js literal.css

documentation:
	rm -rf ./documentation/build
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run ../fn/deno/make-modules.js documentation/build documentation/module.js documentation/module.css
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run ../fn/deno/make-modules.js documentation/build/details-toggle/shadow.css ../details-toggle/shadow.css

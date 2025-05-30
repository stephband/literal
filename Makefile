 DEBUG=

# Tell make to ignore existing folders and allow overwriting existing files
.PHONY: modules literal comments documentation build

# Must format with tabs not spaces
literal:
	deno run --allow-read --allow-write --allow-net --allow-env --allow-run --no-lock --reload --config ./deno.json ./deno/make-literal.js ./ debug

comments:
	deno run --allow-read --allow-write --allow-net --allow-env --allow-run ./deno/make-comments.js ./modules/ ./stuff/ ./documentation/templates/page.literal debug

build:
	rm -rf ./deno.lock
	rm -rf ./build
	deno run --allow-read --allow-write --allow-net --allow-env --allow-run --no-lock --reload --config ./deno.json ../fn/deno/make-modules.js build ./module.js ./literal-html/element.js
	#deno run --allow-read --allow-write --allow-net --allow-env --allow-run --no-lock --reload --config ./deno.json https://cdn.jsdelivr.net/gh/stephband/fn@master/deno/make-modules.js --debug build-debug ./module.js ./literal-html/element.js

documentation:
	rm -rf ./documentation/build
	deno run --allow-read --allow-write --allow-net --allow-env --allow-run --no-lock --reload --config ./deno.json https://cdn.jsdelivr.net/gh/stephband/fn@master/deno/make-modules.js documentation/build documentation/module.js
	deno run --allow-read --allow-write --allow-net --allow-env --allow-run --no-lock --reload --config ./deno.json https://cdn.jsdelivr.net/gh/stephband/fn@master/deno/make-css.js documentation/build documentation/module.css

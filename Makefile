 DEBUG=

# Tell make to ignore existing folders and allow overwriting existing files
.PHONY: modules literal comments documentation build

# Must format with tabs not spaces
literal:
	deno run --allow-all ./deno/make-literal.js ./ debug

comments:
	deno run --allow-all ./deno/make-comments.js ./modules/ ./stuff/ ./documentation/templates/page.literal debug

build:
	rm -rf ./deno.lock
	rm -rf ./build
	deno run --allow-all --reload --config ./deno.json https://cdn.jsdelivr.net/gh/stephband/fn@master/deno/make-modules.js build ./module.js ./literal-html/element.js
	deno run --allow-all --reload --config ./deno.json https://cdn.jsdelivr.net/gh/stephband/fn@master/deno/make-modules.js --debug build-debug ./module.js ./literal-html/element.js

documentation:
	rm -rf ./documentation/build
	deno run --allow-all --config ./deno.json https://cdn.jsdelivr.net/gh/stephband/fn@master/modules/deno/make-modules.js documentation/build documentation/module.js documentation/module.css
	deno run --allow-all --config ./deno.json https://cdn.jsdelivr.net/gh/stephband/fn@master/modules/deno/make-modules.js documentation/build/details-toggle/shadow.css ../details-toggle/shadow.css

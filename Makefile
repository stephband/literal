DEBUG=

# Tell make to ignore existing folders and allow overwriting existing files
.PHONY: modules literal comments documentation build

# Must format with tabs not spaces
literal:
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run ./deno/make-literal.js ./ debug

comments:
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run --unstable ./deno/make-comments.js ./modules/ ./stuff/ ./documentation/templates/page.literal debug

build:
	rm -rf ./build
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run --config ./deno.json ../fn/deno/make-modules.js build \
		module.js \
		literal-html/module.js \
		element/element.js \
		data/clock.js \
		#module.css

documentation:
	rm -rf ./documentation/build
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run --config ./deno.json ../fn/deno/make-modules.js documentation/build documentation/module.js documentation/module.css
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run --config ./deno.json ../fn/deno/make-modules.js documentation/build/details-toggle/shadow.css ../details-toggle/shadow.css

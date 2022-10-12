DEBUG=

# Tell make to ignore existing folders and allow overwriting existing files
.PHONY: modules literal

# Must format with tabs not spaces
literal:
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run --unstable ./deno/make-literal.js ./ debug

modules:
	rm -rf ./build
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run ../fn/deno/make-modules.js build module.js module.css
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run ../fn/deno/make-modules.js build include-template.js include-template.css
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run ../fn/deno/make-modules.js build define-element.js
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run ../fn/deno/make-modules.js build literal.js literal.css

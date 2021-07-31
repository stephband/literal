DEBUG=

# Tell make to ignore existing folders and allow overwriting existing files
.PHONY: modules literal

# Must format with tabs not spaces
literal:
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run --unstable ./generate.js ./ debug

modules:
	deno run --allow-read --allow-env --allow-net --allow-write --allow-run ../bolt/deno/modules.js packaged module.js module.css
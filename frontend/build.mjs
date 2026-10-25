import { cp, mkdir, rm } from "node:fs/promises";
import { build } from "esbuild";

await rm("dist", { recursive: true, force: true });
await mkdir("dist/public", { recursive: true });
await cp("src", "dist/public", { recursive: true });
await cp("server.mjs", "dist/server.mjs");
await build({
  entryPoints: ["src/sentry-init.js"],
  bundle: true,
  minify: true,
  outfile: "dist/public/sentry.min.js",
});

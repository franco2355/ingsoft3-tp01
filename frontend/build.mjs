import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist/public", { recursive: true });
await cp("src", "dist/public", { recursive: true });
await cp("server.mjs", "dist/server.mjs");

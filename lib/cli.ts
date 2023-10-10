#!/usr/bin/env node

import path from "path";
import { main } from "./main";


const entry = process.argv[2]; // ex. node dist/dev.js ./main.js
const entryPath = path.resolve(process.cwd(), entry);

const outfile = process.argv[3]; // ex. node dist/dev.js ./main.js ./metrics.html
const outfilePath = path.resolve(process.cwd(), outfile);
const width = process.argv[4]; // ex. node dist/dev.js ./main.js ./metrics.html 1280
const height = process.argv[5]; // ex. node dist/dev.js ./main.js ./metrics.html 1280 4000

if (!entry || !outfile || !width || !height) {
  console.error("Usage: require-racer ./main.js ./metrics.html 1280 4000");
  process.exit(1);
}

main({
  entryPath,
  outfilePath,
  canvasWidth: Number(width),
  canvasHeight: Number(height),
}).catch((e) => console.error(e));

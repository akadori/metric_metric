#!/usr/bin/env node

import path from "path";
import { main } from "./main";


const entry = process.argv[2]; // ex. node dist/dev.js ./main.js
const entryPath = path.resolve(process.cwd(), entry);

const outfile = process.argv[3]; // ex. node dist/dev.js ./main.js ./metrics.html
const outfilePath = path.resolve(process.cwd(), outfile);

main({
  entryPath,
  outfilePath,
  canvasWidth: 4000,
  canvasHeight: 4000,
}).catch((e) => console.error(e));

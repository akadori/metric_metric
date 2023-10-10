#!/usr/bin/env node

import path from "path";
import { main } from "./main";
import { Command } from "commander";

const program = new Command();
program
  .name("require-racer")
  .description("Measure require time of each module and draw metrics")
  .version("0.0.1");
program
  .option("-w, --width <width>", "canvas width(px)")
  .option("-h, --height <height>", "canvas height(px)")
  .option("-o, --outfile <outfile>", "outfile path")
  .option("-t, --threshold <threshold>", "threshold(ms)")
  .arguments("<entry>")
  .parse(process.argv);

const { width, height, outfile, threshold } = program.opts();
const entry = program.args[0];
const entryPath = path.resolve(process.cwd(), entry);
const outfilePath = path.resolve(process.cwd(), outfile);

main({
  entryPath,
  outfilePath,
  canvasWidth: Number(width),
  canvasHeight: Number(height),
  threshold: threshold ? Number(threshold) : undefined,
}).catch((e) => console.error(e));

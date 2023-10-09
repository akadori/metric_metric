import fs from "fs";
import Module from "module";
import path from "path";
import { promisify } from "util";
import { Scores } from "./type";
// @ts-ignore
const originalLoad = Module._load;

const writeFileAsync = promisify(fs.writeFile);

function buildScoreFunction(scores: Scores, depth: number) {
  function loadAndScoreLoadTime(
    request: string,
    parent: Module,
    isMain: boolean,
  ): Module {
    depth++;
    const start = new Date();
    const result = originalLoad(request, parent, isMain);
    const end = new Date();
    depth--;
    scores.push({
      name: request,
      start: start.toISOString(),
      end: end.toISOString(),
      duration: end.getTime() - start.getTime(),
      parent: parent.filename,
      depth,
    });
    return result;
  }
  return loadAndScoreLoadTime;
}

export class Scorer {
  scores: Scores;
  depth: number;

  constructor() {
    this.scores = [];
    this.depth = 0;
  }

  start() {
    // @ts-ignore
    Module._load = buildScoreFunction(this.scores, this.depth);
  }

  stop(): Scores {
    // @ts-ignore
    Module._load = originalLoad;
    return this.scores;
  }

  async write() {
    const metricsPath = path.join(__dirname, "../metrics.json");
    await writeFileAsync(metricsPath, JSON.stringify(this.scores, null, 2));
  }
}

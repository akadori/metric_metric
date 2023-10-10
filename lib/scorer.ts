import { writeFileAsync } from "./util";
import Module from "module";
import path from "path";
import { Scores } from "./type";
// @ts-ignore
const originalLoad = Module._load;


function buildScoreFunction(scores: Scores, depth: number, option?: { threshold: number }) {
  const threshold = option?.threshold ?? 0;
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
    const duration = end.getTime() - start.getTime();
    if (duration < threshold) {
      return result;
    }
    scores.push({
      name: request,
      start: start.toISOString(),
      end: end.toISOString(),
      duration: duration,
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
  threshold: number;

  constructor(threshold = 0) {
    this.scores = [];
    this.depth = 0;
    this.threshold = threshold;
  }

  start() {
    // @ts-ignore
    Module._load = buildScoreFunction(this.scores, this.depth, { threshold: this.threshold });
  }

  stop(): Scores {
    // @ts-ignore
    Module._load = originalLoad;
    return this.scores;
  }
}


import fs from "fs";
import path from "path";
import { promisify } from "util";
import Module from "module";
// @ts-ignore
const originalLoad = Module._load;

const writeFileAsync = promisify(fs.writeFile);

type ScoreForRequire = {
  name: string;
  start: Date;
  end: Date;
  duration: number;
  parent: string;
  depth: number;
};
const scores: Array<ScoreForRequire> = [];
let depth = 0;
export const ModuleGraphMetricPlugin = {
  beforeStart: () => {
    console.log("ModuleGraphMetricPlugin before start registering...");
    // @ts-ignore
    Module._load = loadAndMetric;
  },
  afterStart: () => {
    if (originalLoad) {
      // @ts-ignore
      Module._load = originalLoad;
    }
  },
  beforeStop: async () => {
    const metricsPath = path.join(__dirname, "../metrics.json");
    await writeFileAsync(metricsPath, JSON.stringify(scores, null, 2));
  },
};

function loadAndMetric(
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
    start,
    end,
    duration: end.getTime() - start.getTime(),
    parent: parent.filename,
    depth,
  });
  return result;
}

const entry = process.argv[2]; // ex. node dist/dev.js ./main 
console.log("entry", entry)

const main = async () => {
  ModuleGraphMetricPlugin.beforeStart();
  require(entry);
  ModuleGraphMetricPlugin.afterStart();

  if (ModuleGraphMetricPlugin.beforeStop) {
    ModuleGraphMetricPlugin.beforeStop();
  }
};

main().catch((e) => console.error(e));

import Module from "module";
// @ts-ignore
const originalLoad = Module._load;

type ModuleRequiredMetric = {
  name: string;
  start: Date;
  end: Date;
  duration: number;
  parent: string;
  depth: number;
};
const metrics: Array<ModuleRequiredMetric> = [];
let depth = 0;
export const ModuleGraphMetricPlugin = {
  beforeStart: () => {
    console.log("ModuleGraphMetricPlugin before start registering...");
    const spyedLoad = function (
      request: string,
      parent: Module,
      isMain: boolean,
    ) {
      depth++;
      const start = new Date();
      const result = originalLoad(request, parent, isMain);
      const end = new Date();
      depth--;
      metrics.push({
        name: request,
        start,
        end,
        duration: end.getTime() - start.getTime(),
        parent: parent.filename,
        depth,
      });
      return result;
    };
    // @ts-ignore
    Module._load = spyedLoad;
  },
  afterStart: () => {
    if (originalLoad) {
      // @ts-ignore
      Module._load = originalLoad;
    }
  },
  beforeStop: async () => {
    const fs = require("fs") as typeof import("fs");
    const path = require("path") as typeof import("path");
    const { promisify } = require("util");
    const writeFileAsync = promisify(fs.writeFile);
    const metricsPath = path.join(__dirname, "../metrics.json");
    await writeFileAsync(metricsPath, JSON.stringify(metrics, null, 2));
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
  metrics.push({
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

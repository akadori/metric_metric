"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scorer = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const module_1 = __importDefault(require("module"));
// @ts-ignore
const originalLoad = module_1.default._load;
const writeFileAsync = (0, util_1.promisify)(fs_1.default.writeFile);
// const scores: Array<ScoreForRequire> = [];
// let depth = 0;
// export const ModuleGraphMetricPlugin = {
//   beforeStart: () => {
//     console.log("ModuleGraphMetricPlugin before start registering...");
//     // @ts-ignore
//     Module._load = loadAndMetric;
//   },
//   afterStart: () => {
//     if (originalLoad) {
//       // @ts-ignore
//       Module._load = originalLoad;
//     }
//   },
//   beforeStop: async () => {
//     const metricsPath = path.join(__dirname, "../metrics.json");
//     await writeFileAsync(metricsPath, JSON.stringify(scores, null, 2));
//   },
// };
// function loadAndMetric(
//   request: string,
//   parent: Module,
//   isMain: boolean,
// ): Module {
//   depth++;
//   const start = new Date();
//   const result = originalLoad(request, parent, isMain);
//   const end = new Date();
//   depth--;
//   scores.push({
//     name: request,
//     start,
//     end,
//     duration: end.getTime() - start.getTime(),
//     parent: parent.filename,
//     depth,
//   });
//   return result;
// }
// const main = async () => {
//   ModuleGraphMetricPlugin.beforeStart();
//   require(entry);
//   ModuleGraphMetricPlugin.afterStart();
//   if (ModuleGraphMetricPlugin.beforeStop) {
//     ModuleGraphMetricPlugin.beforeStop();
//   }
// };
// main().catch((e) => console.error(e));
function buildScoreFunction(scores, depth) {
    function loadAndScoreLoadTime(request, parent, isMain) {
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
    return loadAndScoreLoadTime;
}
class Scorer {
    constructor() {
        this.scores = [];
        this.depth = 0;
    }
    start() {
        // @ts-ignore
        module_1.default._load = buildScoreFunction(this.scores, this.depth);
    }
    stop() {
        // @ts-ignore
        module_1.default._load = originalLoad;
    }
    write() {
        return __awaiter(this, void 0, void 0, function* () {
            const metricsPath = path_1.default.join(__dirname, "../metrics.json");
            yield writeFileAsync(metricsPath, JSON.stringify(this.scores, null, 2));
        });
    }
}
exports.Scorer = Scorer;

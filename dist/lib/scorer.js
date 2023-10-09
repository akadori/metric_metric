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
const module_1 = __importDefault(require("module"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
// @ts-ignore
const originalLoad = module_1.default._load;
const writeFileAsync = (0, util_1.promisify)(fs_1.default.writeFile);
function buildScoreFunction(scores, depth) {
    function loadAndScoreLoadTime(request, parent, isMain) {
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
        return this.scores;
    }
    write() {
        return __awaiter(this, void 0, void 0, function* () {
            const metricsPath = path_1.default.join(__dirname, "../metrics.json");
            yield writeFileAsync(metricsPath, JSON.stringify(this.scores, null, 2));
        });
    }
}
exports.Scorer = Scorer;

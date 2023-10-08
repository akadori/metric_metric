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
exports.ModuleGraphMetricPlugin = void 0;
const module_1 = __importDefault(require("module"));
// @ts-ignore
const originalLoad = module_1.default._load;
const metrics = [];
let depth = 0;
exports.ModuleGraphMetricPlugin = {
    beforeStart: () => {
        console.log("ModuleGraphMetricPlugin before start registering...");
        const spyedLoad = function (request, parent, isMain) {
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
        module_1.default._load = spyedLoad;
    },
    afterStart: () => {
        if (originalLoad) {
            // @ts-ignore
            module_1.default._load = originalLoad;
        }
    },
    beforeStop: () => __awaiter(void 0, void 0, void 0, function* () {
        const fs = require("fs");
        const path = require("path");
        const { promisify } = require("util");
        const writeFileAsync = promisify(fs.writeFile);
        const metricsPath = path.join(__dirname, "../metrics.json");
        yield writeFileAsync(metricsPath, JSON.stringify(metrics, null, 2));
    }),
};
const entry = process.argv[2]; // ex. node dist/dev.js ./main 
console.log("entry", entry);
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    exports.ModuleGraphMetricPlugin.beforeStart();
    require(entry);
    exports.ModuleGraphMetricPlugin.afterStart();
    if (exports.ModuleGraphMetricPlugin.beforeStop) {
        exports.ModuleGraphMetricPlugin.beforeStop();
    }
});
main().catch((e) => console.error(e));

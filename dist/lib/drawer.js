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
exports.main = void 0;
const fs_1 = __importDefault(require("fs"));
const canvas_1 = require("canvas");
const debug_1 = __importDefault(require("debug"));
const roughjs_1 = __importDefault(require("roughjs"));
const infoLogger = (0, debug_1.default)("info");
function main(config) {
    return __awaiter(this, void 0, void 0, function* () {
        infoLogger("start");
        const metrics = config.src;
        const canvas = (0, canvas_1.createCanvas)(config.width, config.height);
        const context = canvas.getContext("2d");
        // @ts-ignore
        const rc = roughjs_1.default.canvas(canvas);
        context.font = "30px serif"; // TODO: make it configurable
        const epoch = metrics.reduce((acc, cur) => {
            const start = new Date(cur.start).getTime();
            return acc < start ? acc : start;
        }, Infinity);
        const colorScheme = (metric) => {
            switch (metric.depth % 3) {
                case 0:
                    return "#ff0000";
                case 1:
                    return "#00ff00";
                case 2:
                    return "#0000ff";
                default:
                    return "#000000";
            }
        };
        const origin = {
            top: 300,
            left: 300,
        };
        const ratio = 100;
        yield drawVerticalAxis(rc, context, metrics, {
            epoch,
            ratio,
            colorScheme,
            origin,
        });
        yield drawHorizontalAxis(rc, context, metrics, {
            epoch,
            ratio,
            colorScheme,
            origin,
        });
        yield drawRectangles(rc, context, metrics, {
            epoch,
            ratio,
            colorScheme,
            origin,
        });
        render(canvas);
    });
}
exports.main = main;
function drawVerticalAxis(canvas, context, metrics, option) {
    return __awaiter(this, void 0, void 0, function* () {
        const { line, ticks } = verticalAxis(metrics, option);
        canvas.line(line.from.x, line.from.y, line.to.x, line.to.y, {
            stroke: "#000000",
            strokeWidth: 1,
            roughness: 0.5,
        });
        ticks.forEach((tick) => {
            canvas.line(tick.left - 10, tick.top, tick.left, tick.top, {
                stroke: "#000000",
                strokeWidth: 1,
                roughness: 0.5,
            });
            context.fillText(tick.label, tick.left - 20, tick.top + 10);
        });
    });
}
function verticalAxis(metrics, option) {
    const maxDepth = metrics.reduce((acc, cur) => {
        return acc < cur.depth ? cur.depth : acc;
    }, 0);
    const line = {
        from: {
            x: option.origin.left,
            y: option.origin.top,
        },
        to: {
            x: option.origin.left,
            y: option.origin.top + (maxDepth + 1) * option.ratio,
        },
    };
    const ticks = [];
    for (let i = 0; i <= maxDepth; i++) {
        ticks.push({
            top: option.origin.top + (i + 0.5) * option.ratio,
            left: option.origin.left,
            label: i.toString(),
        });
    }
    return {
        line,
        ticks,
    };
}
function drawHorizontalAxis(canvas, context, metrics, option) {
    const { line, ticks } = horizontalAxis(metrics, option);
    canvas.line(line.from.x, line.from.y, line.to.x, line.to.y, {
        stroke: "#ff0000",
        strokeWidth: 1,
        roughness: 0.5,
    });
    ticks.forEach((tick) => {
        canvas.line(tick.left, tick.top, tick.left, tick.top - 10, {
            stroke: "#ff0000",
            strokeWidth: 1,
            roughness: 0.5,
        });
        context.fillText(tick.label, tick.left - 20, tick.top - 20);
    });
}
function horizontalAxis(metrics, option) {
    const maxDuration = metrics.reduce((acc, cur) => {
        return acc < cur.duration ? cur.duration : acc;
    }, 0);
    const line = {
        from: {
            x: option.origin.left,
            y: option.origin.top,
        },
        to: {
            x: option.origin.left + maxDuration * option.ratio,
            y: option.origin.top,
        },
    };
    const ticks = [];
    for (let i = 1; i <= 10; i++) {
        ticks.push({
            top: option.origin.top,
            left: option.origin.left + (maxDuration / 10) * i * option.ratio,
            label: `${((maxDuration / 10) * i).toFixed(2)}ms`,
        });
    }
    return {
        line,
        ticks,
    };
}
function drawRectangles(canvas, context, metrics, option) {
    return __awaiter(this, void 0, void 0, function* () {
        const rectangles = metrics.map((metric) => createRectFromMetric(metric, option));
        rectangles.forEach((rectangle) => {
            canvas.rectangle(rectangle.left, rectangle.top, rectangle.width, rectangle.height, {
                fill: rectangle.color,
                roughness: 0.5,
            });
            context.fillText(rectangle.message.value, rectangle.left, rectangle.top + 50);
        });
    });
}
function createRectFromMetric(metric, option) {
    return {
        left: (new Date(metric.start).getTime() - option.epoch) * option.ratio +
            option.origin.left,
        top: metric.depth * option.ratio + option.origin.top,
        width: metric.duration * option.ratio,
        height: option.ratio,
        color: option.colorScheme(metric),
        message: {
            value: metric.name,
            position: "left",
        },
    };
}
function render(canvas) {
    fs_1.default.writeFileSync("hoge.html", `<img src="${canvas.toDataURL()}" /><script>console.log("uuuu")</script>`);
}

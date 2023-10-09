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
const roughjs_1 = __importDefault(require("roughjs"));
function main(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const scores = config.src;
        const canvas = (0, canvas_1.createCanvas)(config.width, config.height);
        const context = canvas.getContext("2d");
        // @ts-ignore
        const rc = roughjs_1.default.canvas(canvas);
        const ratio = 40;
        const fontSize = ratio / 2;
        context.font = `${fontSize}px serif`; // TODO: make it configurable
        const epoch = scores.reduce((acc, cur) => {
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
            top: 50,
            left: 30,
        };
        verticalAxis(rc, context, scores, {
            epoch,
            ratio,
            colorScheme,
            origin,
            fontSize,
        });
        horizontalAxis(rc, context, scores, {
            epoch,
            ratio,
            colorScheme,
            origin,
        });
        drawRectangles(rc, context, scores, {
            epoch,
            ratio,
            colorScheme,
            origin,
        });
        render(canvas);
    });
}
exports.main = main;
function verticalAxis(canvas, context, scores, option) {
    const maxDepth = scores.reduce((acc, cur) => {
        return acc < cur.depth ? cur.depth : acc;
    }, 0);
    canvas.line(option.origin.left, option.origin.top, option.origin.left, option.origin.top + (maxDepth + 1) * option.ratio, {
        stroke: "#000000",
        strokeWidth: 1,
        roughness: 0.5,
    });
    for (let i = 0; i <= maxDepth; i++) {
        context.fillText(i.toString(), option.origin.left - 20, option.origin.top + (i + 0.5) * option.ratio + (option.fontSize || 0) / 2);
    }
}
function horizontalAxis(canvas, context, scores, option) {
    const maxDuration = scores.reduce((acc, cur) => {
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
    canvas.line(line.from.x, line.from.y, line.to.x, line.to.y, {
        stroke: "#000000",
        strokeWidth: 1,
        roughness: 0,
    });
    ticks.forEach((tick) => {
        canvas.line(tick.left, tick.top, tick.left, tick.top - 10, {
            stroke: "#000000",
            strokeWidth: 1,
            roughness: 0.5,
        });
        context.fillText(tick.label, tick.left - 20, tick.top - 20);
    });
}
function drawRectangles(canvas, context, scores, option) {
    const rectangles = scores.map((score) => {
        return {
            left: (new Date(score.start).getTime() - option.epoch) * option.ratio +
                option.origin.left,
            top: score.depth * option.ratio + option.origin.top,
            width: score.duration * option.ratio,
            height: option.ratio,
            color: option.colorScheme(score),
            duration: score.duration,
            message: {
                value: score.name,
                position: "left",
            },
        };
    });
    rectangles.forEach((rectangle) => {
        canvas.rectangle(rectangle.left, rectangle.top, rectangle.width, rectangle.height, {
            fill: rectangle.color,
            roughness: 0,
        });
        context.fillText(`${rectangle.message.value} ${rectangle.duration}ms`, rectangle.left, rectangle.top + option.ratio / 2);
    });
}
function render(canvas) {
    fs_1.default.writeFileSync("hoge.html", `<img src="${canvas.toDataURL()}" /><script>console.log("uuuu")</script>`);
}

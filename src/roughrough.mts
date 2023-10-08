import fs from "fs";
import { promisify } from "util";
import { Canvas, CanvasRenderingContext2D, createCanvas } from "canvas";
import debug from "debug";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import { z } from "zod";

const MettricSchema = z.object({
  name: z.string(),
  start: z.string(),
  end: z.string(),
  duration: z.number(),
  parent: z.string(),
  depth: z.number(),
});

const MettricArraySchema = z.array(MettricSchema);

type Mettric = z.infer<typeof MettricSchema>;
type Color = `#${string}`;
type Rectangle = {
  left: number;
  top: number;
  width: number;
  height: number;
  color: Color;
};

type Message = {
  value: string;
  position: "left" | "right";
};

type RectangleWithMessage = Rectangle & {
  message: Message;
};

type Option = {
  epoch: number;
  ratio: number;
  colorScheme: (metric: Mettric) => Color;
  origin: {
    top: number;
    left: number;
  };
};

type Line = {
  from: {
    x: number;
    y: number;
  };
  to: {
    x: number;
    y: number;
  };
};

type TickAndLabel = {
  top: number;
  left: number;
  label: string;
};

const infoLogger = debug("info");
type CanvasConfig = {
  width: number;
  height: number;
};

type DataConfig = {
  srcPath: string;
};

async function main(config: CanvasConfig & DataConfig) {
  infoLogger("start");
  const metrics = await readData(config.srcPath);
  const canvas = createCanvas(config.width, config.height);
  const context = canvas.getContext("2d");
  // @ts-ignore
  const rc = rough.canvas(canvas);
  context.font = "30px serif"; // TODO: make it configurable
  const epoch = metrics.reduce((acc, cur) => {
    const start = new Date(cur.start).getTime();
    return acc < start ? acc : start;
  }, Infinity);
  const colorScheme = (metric: Mettric): Color => {
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
  await drawVerticalAxis(rc, context, metrics, {
    epoch,
    ratio,
    colorScheme,
    origin,
  });
  await drawHorizontalAxis(rc, context, metrics, {
    epoch,
    ratio,
    colorScheme,
    origin,
  });
  await drawRectangles(rc, context, metrics, {
    epoch,
    ratio,
    colorScheme,
    origin,
  });
  render(canvas);
}

async function readData(srcPath: string): Promise<Mettric[]> {
  const readFileAsync = promisify(fs.readFile);
  const data = await readFileAsync(srcPath, "utf-8");
  if (typeof data !== "string") {
    throw new Error("data is not string");
  }
  const parsed = MettricArraySchema.parse(JSON.parse(data));
  return parsed;
}

async function drawVerticalAxis(
  canvas: RoughCanvas,
  context: CanvasRenderingContext2D,
  metrics: Mettric[],
  option: Option,
): Promise<void> {
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
}

function verticalAxis(
  metrics: Mettric[],
  option: Option,
): { line: Line; ticks: TickAndLabel[] } {
  const maxDepth = metrics.reduce((acc, cur) => {
    return acc < cur.depth ? cur.depth : acc;
  }, 0);
  const line: Line = {
    from: {
      x: option.origin.left,
      y: option.origin.top,
    },
    to: {
      x: option.origin.left,
      y: option.origin.top + (maxDepth + 1) * option.ratio,
    },
  };
  const ticks: TickAndLabel[] = [];
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

function drawHorizontalAxis(
  canvas: RoughCanvas,
  context: CanvasRenderingContext2D,
  metrics: Mettric[],
  option: Option,
): void {
  const { line, ticks } = horizontalAxis(metrics, option);
  canvas.line(line.from.x, line.from.y, line.to.x, line.to.y, {
    stroke: "#000000",
    strokeWidth: 1,
    roughness: 0.5,
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

function horizontalAxis(
  metrics: Mettric[],
  option: Option,
): { line: Line; ticks: TickAndLabel[] } {
  const maxDuration = metrics.reduce((acc, cur) => {
    return acc < cur.duration ? cur.duration : acc;
  }, 0);
  const line: Line = {
    from: {
      x: option.origin.left,
      y: option.origin.top,
    },
    to: {
      x: option.origin.left + maxDuration * option.ratio,
      y: option.origin.top,
    },
  };
  const ticks: TickAndLabel[] = [];
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

async function drawRectangles(
  canvas: RoughCanvas,
  context: CanvasRenderingContext2D,
  metrics: Mettric[],
  option: Option,
): Promise<void> {
  const rectangles = metrics.map((metric) =>
    createRectFromMetric(metric, option),
  );
  rectangles.forEach((rectangle) => {
    canvas.rectangle(
      rectangle.left,
      rectangle.top,
      rectangle.width,
      rectangle.height,
      {
        fill: rectangle.color,
        roughness: 0.5,
      },
    );
    context.fillText(
      rectangle.message.value,
      rectangle.left,
      rectangle.top + 50,
    );
  });
}

function createRectFromMetric(
  metric: Mettric,
  option: Option,
): RectangleWithMessage {
  return {
    left:
      (new Date(metric.start).getTime() - option.epoch) * option.ratio +
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

function render(canvas: Canvas) {
  fs.writeFileSync(
    "hoge.html",
    `<img src="${canvas.toDataURL()}" /><script>console.log("uuuu")</script>`,
  );
}

main({
  width: 4000,
  height: 4000,
  srcPath:
    "/Users/shuhei.tamari/ghq/github.com/shuhei.tamari/metric_metric/metrics.json",
}).catch((e) => {
  console.error(e);
  process.exit(1);
});

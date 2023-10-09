import { main as drawerMain } from "./drawer";
import { Scorer } from "./scorer";
type RequireRacerInput = {
  entryPath: string;
  canvasWidth: number;
  canvasHeight: number;
};

const main = async (input: RequireRacerInput) => {
  const scorer = new Scorer();
  scorer.start();
  require(input.entryPath);
  const scores = scorer.stop();
  await drawerMain({
    width: input.canvasWidth,
    height: input.canvasHeight,
    src: scores,
  });
};

const entry = process.argv[2]; // ex. node dist/dev.js ./main
console.log("entry", entry);

main({
  entryPath: entry,
  canvasWidth: 4000,
  canvasHeight: 4000,
}).catch((e) => console.error(e));

import { main as drawerMain } from "./drawer";
import { Scorer } from "./scorer";
type RequireRacerInput = {
  entryPath: string;
  outfilePath: string;
  canvasWidth: number;
  canvasHeight: number;
  threshold?: number;
};

export const main = async (input: RequireRacerInput) => {
  const scorer = new Scorer(input.threshold);
  scorer.start();
  require(input.entryPath);
  const scores = scorer.stop();
  await drawerMain({
    width: input.canvasWidth,
    height: input.canvasHeight,
    src: scores,
    outfilePath: input.outfilePath,
  });
};
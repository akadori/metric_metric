import { Scorer } from "./scorer";

const entry = process.argv[2]; // ex. node dist/dev.js ./main 
console.log("entry", entry);

const main = async () => {
  const scorer = new Scorer();
  scorer.start();
  require(entry);
  scorer.stop();
  await scorer.write();
};

main().catch((e) => console.error(e));
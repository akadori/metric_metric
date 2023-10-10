
import { promisify } from "util";
import fs from "fs";

export const writeFileAsync = promisify(fs.writeFile);
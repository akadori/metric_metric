import { ZodArray, z } from "zod";
export const ScoreSchema = z.object({
  name: z.string(),
  start: z.string(),
  end: z.string(),
  duration: z.number(),
  parent: z.string(),
  depth: z.number(),
});

export const ScoresSchema = z.array(ScoreSchema);

export type Score = z.infer<typeof ScoreSchema>;
export type Scores = z.infer<typeof ScoresSchema>;
declare global {
  const VERSION: string; // esbuild will define this variable
}

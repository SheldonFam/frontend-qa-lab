import "dotenv/config";
import { z } from "zod";

const envSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(3000),
    FRONTEND_URL: z.string().url().default("http://localhost:5173"),
    PLANNER_CLIENT: z.enum(["mock", "openai"]).default("mock"),
    OPENAI_MODEL: z.string().min(1).default("gpt-6-astra"),
    OPENAI_API_KEY: z.string().optional(),
  })
  .refine(
    (value) =>
      value.PLANNER_CLIENT !== "openai" || Boolean(value.OPENAI_API_KEY),
    {
      message: "OPENAI_API_KEY is required when PLANNER_CLIENT is openai",
      path: ["OPENAI_API_KEY"],
    },
  );

export const env = envSchema.parse(process.env);

import { z } from "zod";
import { testConfigurationSchema } from "./test-configuration.schema.js";

export const createRunInputSchema = z.strictObject({
  configuration: testConfigurationSchema,
  requirements: z.string().trim().min(1),
});

export type CreateRunInput = z.infer<typeof createRunInputSchema>;

import { z } from "zod";

const viewportSchema = z.object({
  name: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const testConfigurationSchema = z.object({
  targetUrl: z.url(),
  languages: z.string().array().min(1),
  routes: z.string().array().min(1),
  viewports: z.array(viewportSchema).min(1),
});

export type TestConfiguration = z.infer<typeof testConfigurationSchema>;

export type Viewport = z.infer<typeof viewportSchema>;

import { z } from "zod";

const viewportSchema = z.object({
  name: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

function isOnTargetWebsite(targetUrl: string, route: string): boolean {
  try {
    const target = new URL(targetUrl);
    const destination = new URL(route, target);

    return destination.origin === target.origin;
  } catch {
    return false;
  }
}

export const testConfigurationSchema = z
  .object({
    targetUrl: z.url({ protocol: /^https?$/ }),
    languages: z.string().array().min(1),
    routes: z.string().startsWith("/").array().min(1),
    viewports: z.array(viewportSchema).min(1),
  })
  .refine(
    (configuration) =>
      configuration.routes.every((route) =>
        isOnTargetWebsite(configuration.targetUrl, route),
      ),
    {
      message: "Routes must stay on the target website",
      path: ["routes"],
    },
  );

export type TestConfiguration = z.infer<typeof testConfigurationSchema>;

export type Viewport = z.infer<typeof viewportSchema>;

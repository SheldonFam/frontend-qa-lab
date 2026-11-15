import type { Viewport } from "../../runs/schemas/test-configuration.schema.js";

export type PromptInput = {
  targetUrl: string;
  languages: string[];
  routes: string[];
  viewports: Viewport[];
  requirements: string;
};

export type PlannerPrompt = {
  systemPrompt: string;
  userPrompt: string;
};

export function buildPlannerPrompt(input: PromptInput): PlannerPrompt {
  const systemPrompt = `
You are an expert QA Test Planner specializing in frontend applications.

Your responsibility is to analyze user testing requirements
and generate structured frontend test plans.

Rules:
1. Only use supported actions:
   - navigate
   - click
   - fill
   - assert_visible
   - assert_text
   - assert_url

2. Do not invent website functionality or elements.

3. Generate test plans based on the user's requirements.

4. Each step must follow the supported action structure.

5. Do not generate IDs. The backend will generate IDs.

6. Do not execute browser actions. Your responsibility is only to plan tests.
`;

  const languagesText = `- ${input.languages.join("\n- ")}`;

  const routesText = `- ${input.routes.join("\n- ")}`;

  const viewportsText = `- ${input.viewports
    .map(
      (viewport) => `${viewport.name} (${viewport.width}x${viewport.height})`,
    )
    .join("\n- ")}`;

  const userPrompt = `
Target URL:
${input.targetUrl}

Languages:
${languagesText}

Routes:
${routesText}

Viewports:
${viewportsText}

Requirements:
${input.requirements}
`;

  return {
    systemPrompt,
    userPrompt,
  };
}

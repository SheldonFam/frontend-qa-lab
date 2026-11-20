import { z } from "zod";

// 1. Step Scope
const testPlanStepScopeSchema = z
  .strictObject({
    routes: z.array(z.string()).min(1).optional(),
    languages: z.array(z.string()).min(1).optional(),
  })
  .refine(
    (scope) => scope.routes !== undefined || scope.languages !== undefined,
    {
      message: "At least one scope condition is required",
    },
  );

// 2. Base Actions
const navigateStepSchema = z.strictObject({
  action: z.literal("navigate"),
  target: z.string(),
  scope: testPlanStepScopeSchema.optional(),
});

const clickStepSchema = z.strictObject({
  action: z.literal("click"),
  target: z.string(),
  scope: testPlanStepScopeSchema.optional(),
});

const fillStepSchema = z.strictObject({
  action: z.literal("fill"),
  target: z.string(),
  value: z.string(),
  scope: testPlanStepScopeSchema.optional(),
});

const assertVisibleStepSchema = z.strictObject({
  action: z.literal("assert_visible"),
  target: z.string(),
  scope: testPlanStepScopeSchema.optional(),
});

const assertTextStepSchema = z.strictObject({
  action: z.literal("assert_text"),
  target: z.string(),
  expectedResult: z.string(),
  scope: testPlanStepScopeSchema.optional(),
});

const assertUrlStepSchema = z.strictObject({
  action: z.literal("assert_url"),
  expectedResult: z.string(),
  scope: testPlanStepScopeSchema.optional(),
});

// 3. Combine Supported Actions
const testPlanStepSchema = z.discriminatedUnion("action", [
  navigateStepSchema,
  clickStepSchema,
  fillStepSchema,
  assertVisibleStepSchema,
  assertTextStepSchema,
  assertUrlStepSchema,
]);

const testPlanStepWithIdSchema = z.discriminatedUnion("action", [
  navigateStepSchema.extend({ id: z.string() }),
  clickStepSchema.extend({ id: z.string() }),
  fillStepSchema.extend({ id: z.string() }),
  assertVisibleStepSchema.extend({ id: z.string() }),
  assertTextStepSchema.extend({ id: z.string() }),
  assertUrlStepSchema.extend({ id: z.string() }),
]);

// 4. TestPlan Schemas
export const testPlanOutputSchema = z.strictObject({
  name: z.string(),
  description: z.string(),
  steps: z.array(testPlanStepSchema),
});

export const testPlanSchema = testPlanOutputSchema.extend({
  id: z.string(),
  steps: z.array(testPlanStepWithIdSchema),
});

export type TestPlanOutput = z.infer<typeof testPlanOutputSchema>;
export type TestPlan = z.infer<typeof testPlanSchema>;

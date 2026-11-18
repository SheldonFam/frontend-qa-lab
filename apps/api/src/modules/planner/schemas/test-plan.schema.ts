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
});

const clickStepSchema = z.strictObject({
  action: z.literal("click"),
  target: z.string(),
});

const fillStepSchema = z.strictObject({
  action: z.literal("fill"),
  target: z.string(),
  value: z.string(),
});

const assertVisibleStepSchema = z.strictObject({
  action: z.literal("assert_visible"),
  target: z.string(),
});

const assertTextStepSchema = z.strictObject({
  action: z.literal("assert_text"),
  target: z.string(),
  expectedResult: z.string(),
});

const assertUrlStepSchema = z.strictObject({
  action: z.literal("assert_url"),
  expectedResult: z.string(),
});

// 3. Add Optional Scope
const navigateStepWithScopeSchema = navigateStepSchema.extend({
  scope: testPlanStepScopeSchema.optional(),
});

const clickStepWithScopeSchema = clickStepSchema.extend({
  scope: testPlanStepScopeSchema.optional(),
});

const fillStepWithScopeSchema = fillStepSchema.extend({
  scope: testPlanStepScopeSchema.optional(),
});

const assertVisibleStepWithScopeSchema = assertVisibleStepSchema.extend({
  scope: testPlanStepScopeSchema.optional(),
});

const assertTextStepWithScopeSchema = assertTextStepSchema.extend({
  scope: testPlanStepScopeSchema.optional(),
});

const assertUrlStepWithScopeSchema = assertUrlStepSchema.extend({
  scope: testPlanStepScopeSchema.optional(),
});

// 4. Combine Supported Actions
const testPlanStepSchema = z.discriminatedUnion("action", [
  navigateStepWithScopeSchema,
  clickStepWithScopeSchema,
  fillStepWithScopeSchema,
  assertVisibleStepWithScopeSchema,
  assertTextStepWithScopeSchema,
  assertUrlStepWithScopeSchema,
]);

const testPlanStepWithIdSchema = z.discriminatedUnion("action", [
  navigateStepWithScopeSchema.extend({ id: z.string() }),
  clickStepWithScopeSchema.extend({ id: z.string() }),
  fillStepWithScopeSchema.extend({ id: z.string() }),
  assertVisibleStepWithScopeSchema.extend({ id: z.string() }),
  assertTextStepWithScopeSchema.extend({ id: z.string() }),
  assertUrlStepWithScopeSchema.extend({ id: z.string() }),
]);

// 5. TestPlan Schemas
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

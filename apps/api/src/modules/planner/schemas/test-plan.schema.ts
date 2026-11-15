import { z } from "zod";

// 1. Navigate
const navigateStepSchema = z.strictObject({
  action: z.literal("navigate"),
  target: z.string(),
});

// 2. Click
const clickStepSchema = z.strictObject({
  action: z.literal("click"),
  target: z.string(),
});

// 3. Fill
const fillStepSchema = z.strictObject({
  action: z.literal("fill"),
  target: z.string(),
  value: z.string(),
});

// 4. Assert Visible
const assertVisibleStepSchema = z.strictObject({
  action: z.literal("assert_visible"),
  target: z.string(),
});

// 5. Assert Text
const assertTextStepSchema = z.strictObject({
  action: z.literal("assert_text"),
  target: z.string(),
  expectedResult: z.string(),
});

// 6. Assert URL
const assertUrlStepSchema = z.strictObject({
  action: z.literal("assert_url"),
  expectedResult: z.string(),
});

// Combine all supported actions
const testPlanStepSchema = z.discriminatedUnion("action", [
  navigateStepSchema,
  clickStepSchema,
  fillStepSchema,
  assertVisibleStepSchema,
  assertTextStepSchema,
  assertUrlStepSchema,
]);

const testPlanStepWithIdSchema = z.discriminatedUnion("action", [
  navigateStepSchema.extend({
    id: z.string(),
  }),
  clickStepSchema.extend({
    id: z.string(),
  }),
  fillStepSchema.extend({
    id: z.string(),
  }),
  assertVisibleStepSchema.extend({
    id: z.string(),
  }),
  assertTextStepSchema.extend({
    id: z.string(),
  }),
  assertUrlStepSchema.extend({
    id: z.string(),
  }),
]);

// Test Plan
// LLM Output Schema
export const testPlanOutputSchema = z.strictObject({
  name: z.string(),
  description: z.string(),
  steps: z.array(testPlanStepSchema),
});

// Final Test Plan Schema
export const testPlanSchema = testPlanOutputSchema.extend({
  id: z.string(),
  steps: z.array(testPlanStepWithIdSchema),
});

export type TestPlanOutput = z.infer<typeof testPlanOutputSchema>;
export type TestPlan = z.infer<typeof testPlanSchema>;

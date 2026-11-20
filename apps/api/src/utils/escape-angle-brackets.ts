export function escapeAngleBrackets(value: string): string {
  return value.replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

export function cleanRoutes(routes: string[]): string[] {
  return routes
    .map((route) => route.trim())
    .filter((route) => route.length > 0);
}

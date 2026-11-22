const LANGUAGE_MARKER = "{language}";

export function fillRouteLanguage(route: string, language: string): string {
  return route.replaceAll(LANGUAGE_MARKER, language);
}

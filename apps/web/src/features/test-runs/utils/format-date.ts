export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-MY", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

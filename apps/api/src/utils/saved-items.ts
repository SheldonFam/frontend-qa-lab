export const MAX_SAVED_ITEMS = 50;
export const MAX_SAVED_TEXT_LENGTH = 300;

const LIMIT_REACHED_MESSAGE = `More items were not saved (limit of ${MAX_SAVED_ITEMS} reached).`;

export function shortenText(text: string): string {
  return text.slice(0, MAX_SAVED_TEXT_LENGTH);
}

export function addSavedItem(items: string[], text: string): void {
  if (items.length > MAX_SAVED_ITEMS) {
    return;
  }

  if (items.length === MAX_SAVED_ITEMS) {
    items.push(LIMIT_REACHED_MESSAGE);
    return;
  }

  items.push(text);
}

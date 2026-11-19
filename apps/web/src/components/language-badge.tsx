import { Badge } from "@mantine/core";

interface LanguageBadgeProps {
  language: string;
}

export function LanguageBadge({ language }: LanguageBadgeProps) {
  return (
    <Badge variant="default" size="sm">
      {language.toUpperCase()}
    </Badge>
  );
}

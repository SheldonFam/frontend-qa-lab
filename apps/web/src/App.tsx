import {
  Badge,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";

function App() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <div>
            <Title order={2}>Frontend QA Lab</Title>
            <Text c="dimmed" size="sm">
              AI-powered frontend testing platform
            </Text>
          </div>

          <Badge color="blue" variant="light">
            Development
          </Badge>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Card withBorder>
            <Text c="dimmed" size="sm">
              Total Runs
            </Text>
            <Title order={2}>24</Title>
          </Card>

          <Card withBorder>
            <Text c="dimmed" size="sm">
              Passed
            </Text>
            <Title order={2}>18</Title>
          </Card>

          <Card withBorder>
            <Text c="dimmed" size="sm">
              Failed
            </Text>
            <Title order={2}>6</Title>
          </Card>
        </SimpleGrid>

        <Card withBorder>
          <Title order={4}>Recent Runs</Title>
          <Text c="dimmed" size="sm" mt="sm">
            No test runs yet.
          </Text>
        </Card>
      </Stack>
    </Container>
  );
}

export default App;

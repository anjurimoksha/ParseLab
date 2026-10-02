import React from 'react';
import { Container, Title, Text, SimpleGrid, Card, Button, Group, Badge, ThemeIcon } from '@mantine/core';
import { IconHierarchy2, IconArrowUpCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <Container size="lg" py="xl">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title order={1} size={48} fw={800} c="navy.9" mb="md">
          ParseLab
        </Title>
        <Text size="xl" c="dimmed" style={{ maxWidth: 600, margin: '0 auto' }}>
          Interactive Parser Generator & Visualizer for LL(1) and LALR(1) grammars.
          Build, analyze, and test parsers step by step.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
        <Card shadow="md" radius="md" padding="xl" withBorder>
          <Group position="apart" mb="md">
            <ThemeIcon size={60} radius="md" color="navy" variant="light">
              <IconHierarchy2 size={34} />
            </ThemeIcon>
            <Badge color="blue" variant="light" size="lg">Top-Down</Badge>
          </Group>
          <Title order={2} mb="sm">LL(1) Parser</Title>
          <Text c="dimmed" mb="xl">
            Analyze grammars from the top down. Automatically eliminates left recursion
            and performs left factoring before computing FIRST and FOLLOW sets.
          </Text>
          <Button fullWidth size="lg" color="navy" onClick={() => navigate('/topdown')}>
            Generate LL(1) Parser
          </Button>
        </Card>

        <Card shadow="md" radius="md" padding="xl" withBorder>
          <Group position="apart" mb="md">
            <ThemeIcon size={60} radius="md" color="navy" variant="light">
              <IconArrowUpCircle size={34} />
            </ThemeIcon>
            <Badge color="amber" variant="light" size="lg">Bottom-Up</Badge>
          </Group>
          <Title order={2} mb="sm">LALR(1) Parser</Title>
          <Text c="dimmed" mb="xl">
            Analyze grammars from the bottom up. Generates canonical LR(1) items and
            merges them into LALR states, showing action and goto tables.
          </Text>
          <Button fullWidth size="lg" color="navy" onClick={() => navigate('/bottomup')}>
            Generate LALR(1) Parser
          </Button>
        </Card>
      </SimpleGrid>

      <Card shadow="sm" radius="md" padding="xl" withBorder mt="xl" bg="gray.0">
        <Title order={3} align="center" mb="md">How it works</Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <div style={{ textAlign: 'center' }}>
            <Text fw={600}>Enter Grammar</Text>
            <Text size="sm" c="dimmed">Provide your productions in standard notation.</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text fw={600}>Generate Table</Text>
            <Text size="sm" c="dimmed">View step-by-step algorithms and tables.</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text fw={600}>Test Strings</Text>
            <Text size="sm" c="dimmed">Simulate parsing interactively on input strings.</Text>
          </div>
        </SimpleGrid>
      </Card>
    </Container>
  );
}

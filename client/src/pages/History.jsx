import React, { useEffect, useState } from 'react';
import { Container, Title, Card, Text, Button, Group, Badge, SimpleGrid } from '@mantine/core';
import { getGrammars, deleteGrammar } from '../api';

export default function History() {
  const [grammars, setGrammars] = useState([]);

  useEffect(() => {
    fetchGrammars();
  }, []);

  const fetchGrammars = async () => {
    try {
      const res = await getGrammars();
      setGrammars(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGrammar(id);
      fetchGrammars();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container size="xl" py="md">
      <Title order={2} c="navy.9" mb="xl">History</Title>
      
      {grammars.length === 0 ? (
        <Text c="dimmed">No saved grammars found. (Save functionality can be added in the Analysis pages!)</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
          {grammars.map(g => (
            <Card key={g._id} shadow="sm" radius="md" withBorder>
              <Group position="apart" mb="sm">
                <Text fw={600}>{g.name}</Text>
                <Badge color={g.type === 'll1' ? 'blue' : 'amber'}>
                  {g.type.toUpperCase()}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed" mb="md" lineClamp={3} family="monospace">
                {g.rawGrammar}
              </Text>
              <Button variant="light" color="red" fullWidth onClick={() => handleDelete(g._id)}>
                Delete
              </Button>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}

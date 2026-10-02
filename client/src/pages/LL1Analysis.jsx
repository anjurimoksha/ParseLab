import React, { useState } from 'react';
import { Container, Title, Stack, Card, Badge, Text, Group, Button, Alert, Table, ScrollArea, Collapse, SimpleGrid } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ll1Analyze } from '../api';
import { useGrammar } from '../context/GrammarContext';
import GrammarInput from '../components/GrammarInput';
import ParsingTable from '../components/ParsingTable';

export default function LL1Analysis() {
  const [grammar, setGrammar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { ll1Data, setLl1Data } = useGrammar();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ll1Analyze(grammar);
      setLl1Data({ ...res.data, rawGrammar: grammar });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderProductions = (title, productions) => (
    <Card shadow="sm" radius="md" withBorder>
      <Title order={4} mb="md">{title}</Title>
      {productions.map((p, i) => (
        <Text key={i} family="monospace">{p.lhs} &rarr; {p.rhs.join(' ')}</Text>
      ))}
    </Card>
  );

  const renderSets = (title, sets) => (
    <Card shadow="sm" radius="md" withBorder>
      <Title order={4} mb="md">{title}</Title>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Symbol</Table.Th>
            <Table.Th>{title} Set</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {Object.keys(sets).map(k => (
            <Table.Tr key={k}>
              <Table.Td fw={600}>{k}</Table.Td>
              <Table.Td>{'{ ' + sets[k].join(', ') + ' }'}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );

  return (
    <Container size="xl" py="md">
      <Stack spacing="xl">
        <Title order={2} c="navy.9">LL(1) Parser Analysis</Title>
        
        <Card shadow="sm" radius="md" withBorder>
          <Group mb="md">
            <Title order={3}>Grammar Input</Title>
          </Group>
          <GrammarInput
            value={grammar}
            onChange={setGrammar}
            onGenerate={handleGenerate}
            loading={loading}
            type="ll1"
          />
          {error && <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" mt="md">{error}</Alert>}
        </Card>

        {ll1Data && (
          <>
            <Card shadow="sm" radius="md" withBorder>
              <Group mb="md">
                <Title order={3}>Left Recursion Removal</Title>
              </Group>
              {ll1Data.leftRecursion.changed ? (
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  {renderProductions('Original', ll1Data.parsed.productions)}
                  {renderProductions('After Removal', ll1Data.leftRecursion.productions)}
                </SimpleGrid>
              ) : (
                <Badge color="green" size="lg" variant="light">No left recursion found</Badge>
              )}
            </Card>

            <Card shadow="sm" radius="md" withBorder>
              <Group mb="md">
                <Title order={3}>Left Factoring</Title>
              </Group>
              {ll1Data.leftFactored.changed ? (
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  {renderProductions('Before', ll1Data.leftRecursion.productions)}
                  {renderProductions('After Factoring', ll1Data.leftFactored.productions)}
                </SimpleGrid>
              ) : (
                <Badge color="green" size="lg" variant="light">No left factoring required</Badge>
              )}
            </Card>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              <Card shadow="sm" radius="md" withBorder>
                <Group mb="md">
                  <Title order={3}>FIRST Sets</Title>
                </Group>
                {renderSets('FIRST', ll1Data.firstSets)}
              </Card>

              <Card shadow="sm" radius="md" withBorder>
                <Group mb="md">
                  <Title order={3}>FOLLOW Sets</Title>
                </Group>
                {renderSets('FOLLOW', ll1Data.followSets)}
              </Card>
            </SimpleGrid>

            <Card shadow="sm" radius="md" withBorder>
              <Group mb="md">
                <Title order={3}>LL(1) Parsing Table</Title>
              </Group>
              
              {ll1Data.hasConflict && (
                <Alert icon={<IconAlertCircle size="1rem" />} title="Not LL(1)" color="red" mb="md">
                  Grammar has conflicts and is not LL(1). Please check the highlighted cells.
                </Alert>
              )}
              
              <ParsingTable table={ll1Data.table} type="ll1" conflicts={ll1Data.conflicts} />

              <Group position="right" mt="xl">
                <Button 
                  size="lg" 
                  color="navy" 
                  disabled={ll1Data.hasConflict}
                  onClick={() => navigate('/topdown/parse')}
                >
                  Proceed to String Parsing
                </Button>
              </Group>
            </Card>
          </>
        )}
      </Stack>
    </Container>
  );
}



import React, { useState } from 'react';
import { Container, Title, Stack, Card, Badge, Text, Group, Button, Alert, SimpleGrid, Collapse } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { lalrAnalyze } from '../api';
import { useGrammar } from '../context/GrammarContext';
import GrammarInput from '../components/GrammarInput';
import ParsingTable from '../components/ParsingTable';

export default function LALRAnalysis() {
  const [grammar, setGrammar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { lalrData, setLalrData } = useGrammar();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await lalrAnalyze(grammar);
      setLalrData({ ...res.data, rawGrammar: grammar });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderProductions = (productions) => (
    <Card shadow="sm" radius="md" withBorder>
      <Title order={4} mb="md">Augmented Grammar</Title>
      {productions.map((p, i) => (
        <Text key={i} family="monospace">
          <Badge size="xs" mr="xs" color="gray">{i}</Badge>
          {p.lhs} &rarr; {p.rhs.join(' ')}
        </Text>
      ))}
    </Card>
  );

  return (
    <Container size="xl" py="md">
      <Stack spacing="xl">
        <Title order={2} c="navy.9">LALR(1) Parser Analysis</Title>
        
        <Card shadow="sm" radius="md" withBorder>
          <Group mb="md">
            <Title order={3}>Grammar Input</Title>
          </Group>
          <GrammarInput
            value={grammar}
            onChange={setGrammar}
            onGenerate={handleGenerate}
            loading={loading}
            type="lalr"
          />
          {error && <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" mt="md">{error}</Alert>}
        </Card>

        {lalrData && (
          <>
            <Card shadow="sm" radius="md" withBorder>
              <Group mb="md">
                <Title order={3}>Augmentation & Numbering</Title>
              </Group>
              {renderProductions(lalrData.finalProductions)}
            </Card>

            <Card shadow="sm" radius="md" withBorder>
              <Group mb="md">
                <Title order={3}>LALR Parsing Table</Title>
              </Group>
              
              {lalrData.hasConflict && (
                <Alert icon={<IconAlertCircle size="1rem" />} title="Conflicts Detected" color="red" mb="md">
                  Grammar has shift/reduce or reduce/reduce conflicts. It is not LALR(1).
                </Alert>
              )}
              
              <ParsingTable table={lalrData.table} type="lalr" conflicts={lalrData.conflicts} />

              <Group position="right" mt="xl">
                <Button 
                  size="lg" 
                  color="navy" 
                  disabled={lalrData.hasConflict}
                  onClick={() => navigate('/bottomup/parse')}
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

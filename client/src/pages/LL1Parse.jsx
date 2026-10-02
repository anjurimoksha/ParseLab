import React, { useState, useEffect } from 'react';
import { Container, Title, Stack, Card, Group, Badge, TextInput, Button, Alert, Collapse } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useGrammar } from '../context/GrammarContext';
import { ll1Parse } from '../api';
import ParsingTable from '../components/ParsingTable';
import TraceTable from '../components/TraceTable';

export default function LL1Parse() {
  const { ll1Data } = useGrammar();
  const navigate = useNavigate();
  const [inputStr, setInputStr] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableOpened, { toggle: toggleTable }] = useDisclosure(false);

  useEffect(() => {
    if (!ll1Data) {
      navigate('/topdown');
    }
  }, [ll1Data, navigate]);

  if (!ll1Data) return null;

  const handleParse = async () => {
    if (!inputStr.trim()) {
      setError('Input cannot be empty');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await ll1Parse(ll1Data.rawGrammar, inputStr);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const setExample = (ex) => {
    setInputStr(ex);
  };

  return (
    <Container size="xl" py="md">
      <Stack spacing="xl">
        <Group position="apart">
          <Title order={2} c="navy.9">LL(1) String Parsing</Title>
          <Button variant="light" color="navy" onClick={() => navigate('/topdown')}>
            &larr; Back to Analysis
          </Button>
        </Group>

        <Card shadow="sm" radius="md" withBorder>
          <Group position="apart" mb="sm">
            <Title order={4}>Generated Parsing Table</Title>
            <Button variant="subtle" size="xs" onClick={toggleTable}>
              {tableOpened ? 'Hide Table' : 'Show Table'}
            </Button>
          </Group>
          <Collapse in={tableOpened}>
            <ParsingTable table={ll1Data.table} type="ll1" conflicts={ll1Data.conflicts} />
          </Collapse>
        </Card>

        <Card shadow="sm" radius="md" withBorder>
          <Group mb="md">
            <Title order={3}>Test Input String</Title>
          </Group>
          <Group align="flex-end">
            <TextInput
              label="Input String"
              placeholder="e.g. id + id * id"
              value={inputStr}
              onChange={(e) => setInputStr(e.currentTarget.value)}
              style={{ flex: 1 }}
              styles={{ input: { fontFamily: '"JetBrains Mono", monospace' } }}
            />
            <Button color="navy" onClick={handleParse} loading={loading}>
              Parse
            </Button>
          </Group>
          <Group mt="sm">
            <Badge style={{ cursor: 'pointer' }} onClick={() => setExample('id + id * id')}>id + id * id</Badge>
            <Badge style={{ cursor: 'pointer' }} onClick={() => setExample('id + * id')} color="red">id + * id</Badge>
          </Group>
          
          {error && <Alert icon={<IconAlertCircle size="1rem" />} color="red" mt="md">{error}</Alert>}
        </Card>

        {result && (
          <Card shadow="sm" radius="md" withBorder>
            <Group position="apart" mb="md">
              <Title order={3}>Parse Trace</Title>
              {result.accepted ? (
                <Badge color="green" size="xl" leftSection={<IconCheck size="1rem" />}>ACCEPTED</Badge>
              ) : (
                <Badge color="red" size="xl" leftSection={<IconX size="1rem" />}>REJECTED: {result.reason}</Badge>
              )}
            </Group>
            
            <TraceTable trace={result.trace} />
          </Card>
        )}
      </Stack>
    </Container>
  );
}

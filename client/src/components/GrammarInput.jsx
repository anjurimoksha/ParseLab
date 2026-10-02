import React from 'react';
import { Textarea, Select, Button, Group, Stack, Text } from '@mantine/core';

export default function GrammarInput({ value, onChange, onGenerate, loading, type }) {
  const examples = {
    ll1: {
      'Basic Expression': `E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id`,
      'Left Factoring Needed': `S -> i E t S | i E t S e S | a\nE -> b`,
      'Dangling Else (Conflict)': `S -> i E t S | i E t S e S | a\nE -> b`
    },
    lalr: {
      'Simple LALR': `S -> C C\nC -> c C | d`,
      'Expression': `E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id`
    }
  };

  const handleExampleChange = (val) => {
    if (val && examples[type][val]) {
      onChange(examples[type][val]);
    }
  };

  return (
    <Stack spacing="md">
      <Group position="apart" align="flex-end">
        <Text weight={500}>Enter Grammar (one production per line)</Text>
        <Select
          placeholder="Load example"
          data={Object.keys(examples[type])}
          onChange={handleExampleChange}
          clearable
        />
      </Group>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        minRows={8}
        styles={{ input: { fontFamily: '"JetBrains Mono", "Fira Code", monospace' } }}
        placeholder="E -> E + T | T..."
      />
      <Group position="right">
        <Button onClick={onGenerate} loading={loading} color="navy">
          Generate Parser
        </Button>
      </Group>
    </Stack>
  );
}

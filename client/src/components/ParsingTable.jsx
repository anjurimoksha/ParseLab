import React from 'react';
import { Table, Tooltip, ScrollArea, Badge, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export default function ParsingTable({ table, type, conflicts }) {
  if (!table) return null;

  if (type === 'll1') {
    const nonTerminals = Object.keys(table);
    const terminals = Object.keys(table[nonTerminals[0]] || {});

    return (
      <ScrollArea>
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ minWidth: 100 }}>Non-Terminal</Table.Th>
              {terminals.map(t => (
                <Table.Th key={t} style={{ textAlign: 'center' }}>{t}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {nonTerminals.map(nt => (
              <Table.Tr key={nt}>
                <Table.Td fw={600} bg="gray.0">{nt}</Table.Td>
                {terminals.map(t => {
                  const entries = table[nt][t];
                  const hasConflict = entries && entries.length > 1;
                  return (
                    <Table.Td key={t} align="center" bg={hasConflict ? 'red.1' : undefined}>
                      {hasConflict ? (
                        <Tooltip label={`Conflict: ${entries.length} rules`} color="red">
                          <Badge color="red" variant="filled">Conflict</Badge>
                        </Tooltip>
                      ) : entries && entries.length === 1 ? (
                        <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                          r{entries[0]}
                        </span>
                      ) : null}
                    </Table.Td>
                  );
                })}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    );
  }

  if (type === 'lalr') {
    if (table.length === 0) return null;
    const terminals = Object.keys(table[0].ACTION);
    const nonTerminals = Object.keys(table[0].GOTO);

    return (
      <ScrollArea>
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th rowSpan={2} style={{ minWidth: 80, verticalAlign: 'middle' }}>State</Table.Th>
              <Table.Th colSpan={terminals.length} style={{ textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>ACTION</Table.Th>
              <Table.Th colSpan={nonTerminals.length} style={{ textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>GOTO</Table.Th>
            </Table.Tr>
            <Table.Tr>
              {terminals.map(t => <Table.Th key={`act-${t}`} style={{ textAlign: 'center' }}>{t}</Table.Th>)}
              {nonTerminals.map(nt => <Table.Th key={`goto-${nt}`} style={{ textAlign: 'center' }}>{nt}</Table.Th>)}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {table.map((row, i) => (
              <Table.Tr key={i}>
                <Table.Td fw={600} bg="gray.0">{i}</Table.Td>
                {terminals.map(t => {
                  const acts = row.ACTION[t];
                  const hasConflict = acts.length > 1;
                  return (
                    <Table.Td key={`td-act-${t}`} align="center" bg={hasConflict ? 'red.1' : undefined}>
                      {hasConflict ? (
                        <Tooltip label={acts.join(', ')} color="red">
                          <Badge color="red" variant="filled">Conflict</Badge>
                        </Tooltip>
                      ) : acts.length === 1 ? (
                        <Badge color={acts[0].startsWith('s') ? 'blue' : acts[0].startsWith('r') ? 'amber' : 'green'} variant="light">
                          {acts[0]}
                        </Badge>
                      ) : null}
                    </Table.Td>
                  );
                })}
                {nonTerminals.map(nt => (
                  <Table.Td key={`td-goto-${nt}`} align="center">
                    {row.GOTO[nt] !== null ? row.GOTO[nt] : ''}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    );
  }

  return null;
}

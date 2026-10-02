import React from 'react';
import { Table, ScrollArea, Badge, Text } from '@mantine/core';

export default function TraceTable({ trace }) {
  if (!trace || trace.length === 0) return null;

  return (
    <ScrollArea mt="md">
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Step</Table.Th>
            <Table.Th>Stack</Table.Th>
            <Table.Th>Input</Table.Th>
            <Table.Th>Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {trace.map((row, idx) => {
            let color = 'gray';
            if (row.type === 'error') color = 'red';
            else if (row.type === 'success') color = 'green';
            else if (row.type === 'shift' || row.type === 'expand') color = 'blue';
            else if (row.type === 'reduce') color = 'amber';
            else if (row.type === 'match') color = 'teal';

            return (
              <Table.Tr key={idx}>
                <Table.Td>{row.step}</Table.Td>
                <Table.Td>
                  <Text family="monospace" size="sm">{row.stack}</Text>
                </Table.Td>
                <Table.Td>
                  <Text family="monospace" size="sm">{row.input}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={color} variant="light">{row.action}</Badge>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}

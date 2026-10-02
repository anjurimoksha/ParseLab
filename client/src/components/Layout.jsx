import React, { useState } from 'react';
import { AppShell, Burger, Group, NavLink, Title, ActionIcon, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { IconHome, IconHierarchy2, IconArrowUpCircle, IconHistory, IconMathFunction } from '@tabler/icons-react';

export default function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { icon: <IconHome size="1rem" stroke={1.5} />, label: 'Home', path: '/' },
    { icon: <IconHierarchy2 size="1rem" stroke={1.5} />, label: 'Top-Down (LL1)', path: '/topdown' },
    { icon: <IconArrowUpCircle size="1rem" stroke={1.5} />, label: 'Bottom-Up (LALR)', path: '/bottomup' },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <IconMathFunction size={28} color="#1e4a8f" />
            <Title order={3} c="navy.9">ParseLab</Title>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow component={ScrollArea}>
          {links.map((link) => (
            <NavLink
              key={link.path}
              active={location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))}
              label={link.label}
              leftSection={link.icon}
              onClick={() => {
                navigate(link.path);
                if (opened) toggle();
              }}
              color="navy"
              variant="light"
              mb="sm"
              style={{ borderRadius: '8px' }}
            />
          ))}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  colors: {
    navy: [
      '#eef2fa',
      '#dbe4f4',
      '#b3c9e9',
      '#8aaadd',
      '#6691d3',
      '#4e7fcd',
      '#4075ca',
      '#3162b3',
      '#2a57a1',
      '#1e4a8f', // shade 9 is the primary ~ #1E3A8A
    ],
  },
  primaryColor: 'navy',
  primaryShade: 9,
  fontFamily: 'Inter, system-ui, sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", "Fira Code", monospace',
  headings: {
    fontFamily: 'Inter, system-ui, sans-serif',
    sizes: {
      h1: { fontSize: rem(34), fontWeight: '700', lineHeight: '1.2', color: '#0F172A' },
      h2: { fontSize: rem(26), fontWeight: '600', lineHeight: '1.3', color: '#0F172A' },
      h3: { fontSize: rem(20), fontWeight: '600', lineHeight: '1.4', color: '#0F172A' },
    },
  },
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
        fw: 500,
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        withBorder: true,
        shadow: 'sm',
      },
      styles: {
        root: {
          backgroundColor: '#ffffff',
          borderColor: '#E2E8F0',
        }
      }
    },
    Alert: {
      defaultProps: {
        radius: 'md',
      }
    },
    Table: {
      styles: {
        th: {
          color: '#475569',
          fontWeight: 600,
        },
        td: {
          color: '#334155',
        }
      }
    }
  },
  globalStyles: (theme) => ({
    body: {
      backgroundColor: '#F3F6FA',
      color: '#475569',
    },
  }),
});

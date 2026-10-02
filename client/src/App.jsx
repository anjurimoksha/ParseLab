import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

import { theme } from './theme/theme';
import { GrammarProvider } from './context/GrammarContext';

import Layout from './components/Layout';
import Home from './pages/Home';
import LL1Analysis from './pages/LL1Analysis';
import LL1Parse from './pages/LL1Parse';
import LALRAnalysis from './pages/LALRAnalysis';
import LALRParse from './pages/LALRParse';
import History from './pages/History';

function App() {
  return (
    <MantineProvider theme={theme}>
      <GrammarProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="topdown" element={<LL1Analysis />} />
              <Route path="topdown/parse" element={<LL1Parse />} />
              <Route path="bottomup" element={<LALRAnalysis />} />
              <Route path="bottomup/parse" element={<LALRParse />} />
              <Route path="history" element={<History />} />
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </GrammarProvider>
    </MantineProvider>
  );
}

export default App;

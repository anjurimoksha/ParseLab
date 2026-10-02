import React, { createContext, useContext, useState, useEffect } from 'react';

const GrammarContext = createContext();

export const useGrammar = () => useContext(GrammarContext);

export const GrammarProvider = ({ children }) => {
  const [ll1Data, setLl1Data] = useState(() => {
    const saved = sessionStorage.getItem('ll1Data');
    return saved ? JSON.parse(saved) : null;
  });

  const [lalrData, setLalrData] = useState(() => {
    const saved = sessionStorage.getItem('lalrData');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (ll1Data) sessionStorage.setItem('ll1Data', JSON.stringify(ll1Data));
    else sessionStorage.removeItem('ll1Data');
  }, [ll1Data]);

  useEffect(() => {
    if (lalrData) sessionStorage.setItem('lalrData', JSON.stringify(lalrData));
    else sessionStorage.removeItem('lalrData');
  }, [lalrData]);

  return (
    <GrammarContext.Provider value={{ ll1Data, setLl1Data, lalrData, setLalrData }}>
      {children}
    </GrammarContext.Provider>
  );
};

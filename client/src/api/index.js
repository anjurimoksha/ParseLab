import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const ll1Analyze = (grammar) => api.post('/ll1/analyze', { grammar });
export const ll1Parse = (grammar, input) => api.post('/ll1/parse', { grammar, input });

export const lalrAnalyze = (grammar) => api.post('/lalr/analyze', { grammar });
export const lalrParse = (grammar, input) => api.post('/lalr/parse', { grammar, input });

export const getGrammars = () => api.get('/grammars');
export const saveGrammar = (name, type, rawGrammar) => api.post('/grammars', { name, type, rawGrammar });
export const deleteGrammar = (id) => api.delete(`/grammars/${id}`);

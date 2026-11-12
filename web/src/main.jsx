import React from 'react';
import { createRoot } from 'react-dom/client';
import '@radix-ui/themes/styles.css';
import './styles.css';
import Explorer from './explorer';

createRoot(document.getElementById('root')).render(<Explorer />);

import React from 'react';
import { createRoot } from 'react-dom/client';
import '@radix-ui/themes/styles.css';
import './styles.css';
import Explorer from './explorer';
import { ErrorBoundary } from './qol-ui';

createRoot(document.getElementById('root')).render(<ErrorBoundary><Explorer /></ErrorBoundary>);

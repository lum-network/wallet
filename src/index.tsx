import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

import 'clipboard/dist/clipboard.min';
import '@popperjs/core';
import 'bootstrap';
import './styles/_main.scss';

const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(<App />);

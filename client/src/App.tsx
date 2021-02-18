import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';

import Core from './core';
import store, { persistor } from './redux/store';

import './locales';
import './App.css';

const App = (): JSX.Element => (
    <Provider store={store}>
        <PersistGate persistor={persistor}>
            <Core />
        </PersistGate>
    </Provider>
);

export default App;

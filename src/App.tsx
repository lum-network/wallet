import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Core from './core';
import store, { persistor } from './redux/store';

import './locales';
import 'styles/_main.scss';
import { ToastCloseButton } from 'components';

const App = (): JSX.Element => (
    <Provider store={store}>
        <PersistGate persistor={persistor}>
            <Core />
            <ToastContainer
                closeButton={ToastCloseButton}
                hideProgressBar
                newestOnTop
                position="bottom-right"
                draggable={false}
            />
        </PersistGate>
    </Provider>
);

export default App;

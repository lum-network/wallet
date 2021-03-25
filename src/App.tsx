import React from 'react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ToastCloseButton } from './components';
import Core from './core';
import store from './redux/store';

import './locales';

const App = (): JSX.Element => (
    <Provider store={store}>
        <Core />
        <ToastContainer
            closeButton={ToastCloseButton}
            hideProgressBar
            newestOnTop
            position="bottom-right"
            draggable={false}
        />
    </Provider>
);

export default App;

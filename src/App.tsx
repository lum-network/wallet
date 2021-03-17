import React from 'react';
import { Provider } from 'react-redux';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Core from './core';
import store from './redux/store';

import './locales';
import 'styles/_main.scss';
import { ToastCloseButton } from 'components';

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

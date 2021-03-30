import React from 'react';
import { useSelector } from 'react-redux';
import { Switch, Route, BrowserRouter, Redirect } from 'react-router-dom';
import { RootState } from 'redux/store';
import {
    CreateWallet,
    Dashboard,
    ImportHardwareWallet,
    ImportMnemonic,
    Message,
    Send,
    Transactions,
    Welcome,
    Error404,
    ImportPrivateKey,
    ImportKeystore,
} from 'screens';
import MainLayout from './Layout/MainLayout/MainLayout';

const RootNavigator = (): JSX.Element => {
    return (
        <BrowserRouter>
            <MainLayout>
                <Switch>
                    <Route path="/welcome">
                        <Welcome />
                    </Route>
                    <Route path="/create">
                        <CreateWallet />
                    </Route>
                    <Route path="/import/software/mnemonic">
                        <ImportMnemonic />
                    </Route>
                    <Route path="/import/software/privateKey">
                        <ImportPrivateKey />
                    </Route>
                    <Route path="/import/software/keystore">
                        <ImportKeystore />
                    </Route>
                    <Route path="/import/hardware">
                        <ImportHardwareWallet />
                    </Route>
                    <PrivateRoute exact path={['/home', '/']}>
                        <Dashboard />
                    </PrivateRoute>
                    <PrivateRoute exact path="/message">
                        <Message />
                    </PrivateRoute>
                    <PrivateRoute exact path="/send">
                        <Send />
                    </PrivateRoute>
                    <PrivateRoute exact path="/transactions">
                        <Transactions />
                    </PrivateRoute>
                    <Route path="*">
                        <Error404 />
                    </Route>
                </Switch>
            </MainLayout>
        </BrowserRouter>
    );
};

const PrivateRoute = ({
    children,
    path,
    exact,
}: {
    children: React.ReactNode;
    exact?: boolean;
    path: string | string[];
}): JSX.Element => {
    const wallet = useSelector((state: RootState) => state.wallet.currentWallet);

    return (
        <Route exact={exact} path={path}>
            {wallet ? children : <Redirect to="/welcome" />}
        </Route>
    );
};

export default RootNavigator;

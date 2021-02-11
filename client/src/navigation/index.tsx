import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import { Dashboard, Message, Send, Transactions, TransactionDetails } from 'screens';
import MainLayout from './Layout/MainLayout/MainLayout';

const RootNavigator = (): JSX.Element => {
    return (
        <MainLayout>
            <BrowserRouter>
                <Switch>
                    <Route path="/home">
                        <Dashboard />
                    </Route>
                    <Route path="/message">
                        <Message />
                    </Route>
                    <Route path="/send">
                        <Send />
                    </Route>
                    <Route path="/transactions">
                        <Transactions />
                    </Route>
                    <Route path="/transaction/:txId">
                        <TransactionDetails />
                    </Route>
                </Switch>
            </BrowserRouter>
        </MainLayout>
    );
};

export default RootNavigator;

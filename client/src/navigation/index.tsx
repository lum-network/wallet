import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import Buy from 'screens/Buy';
import Exchange from 'screens/Exchange';
import Send from 'screens/Send';
import Dashboard from '../screens/Dashboard';
import MainLayout from './Layout/MainLayout/MainLayout';

const RootNavigator = (): JSX.Element => {
    return (
        <MainLayout>
            <BrowserRouter>
                <Switch>
                    <Route path="/home">
                        <Dashboard />
                    </Route>
                    <Route path="/exchange">
                        <Exchange />
                    </Route>
                    <Route path="/buy">
                        <Buy />
                    </Route>
                    <Route path="/send">
                        <Send />
                    </Route>
                </Switch>
            </BrowserRouter>
        </MainLayout>
    );
};

export default RootNavigator;

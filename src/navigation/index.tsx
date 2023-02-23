import React from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { RootState } from 'redux/store';
import { CreateWallet, Dashboard, Message, Staking, Operations, Welcome, Governance, Error404 } from 'screens';
import MainLayout from './Layout/MainLayout/MainLayout';

const RootNavigator = (): JSX.Element => {
    return (
        <BrowserRouter>
            <MainLayout>
                <Routes>
                    <Route path="/welcome" element={<Welcome />} />
                    <Route path="/create" element={<CreateWallet />} />

                    <Route
                        path="/home?"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/message"
                        element={
                            <PrivateRoute>
                                <Message />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/operations"
                        element={
                            <PrivateRoute>
                                <Operations />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/staking"
                        element={
                            <PrivateRoute>
                                <Staking />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/governance/proposal?/:proposalId?"
                        element={
                            <PrivateRoute>
                                <Governance />
                            </PrivateRoute>
                        }
                    />

                    <Route path="*" element={<Error404 />} />
                </Routes>
            </MainLayout>
        </BrowserRouter>
    );
};

const PrivateRoute = ({ children }: { children: JSX.Element }): JSX.Element => {
    const wallet = useSelector((state: RootState) => state.wallet.currentWallet);

    if (!wallet) {
        return <Navigate to="/welcome" />;
    }

    return children;
};

export default RootNavigator;

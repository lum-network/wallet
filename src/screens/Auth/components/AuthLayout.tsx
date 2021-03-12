import React from 'react';
import { Footer } from 'components';
import Header from './Header';

interface Props {
    children: React.ReactNode;
}

const AuthLayout = ({ children }: Props): JSX.Element => (
    <div className="container-fluid h-100 d-flex flex-column align-items-center justify-content-between px-4">
        <div className="d-flex flex-column align-items-center">
            <Header />
            {children}
        </div>
        <Footer />
    </div>
);

export default AuthLayout;

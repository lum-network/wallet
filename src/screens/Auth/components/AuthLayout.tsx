import React from 'react';
import { Footer } from 'components';
import Header from './Header';

interface Props {
    children: React.ReactNode;
}

const AuthLayout = ({ children }: Props): JSX.Element => (
    <>
        <div className="h-100 d-flex flex-column align-items-center justify-content-between px-4">
            <Header />
            {children}
        </div>
        <footer className="mt-auto">
            <Footer />
        </footer>
    </>
);

export default AuthLayout;

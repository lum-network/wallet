import { Card } from 'components';
import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { RootState } from 'redux/store';

import './Welcome.scss';

const Welcome = (): JSX.Element => {
    const address = useSelector((state: RootState) => state.wallet.address);

    if (address) {
        return <Redirect to="/home" />;
    }

    return (
        <div className="container h-100">
            <div className="row h-100 justify-content-center align-items-center">
                <div className="col-md">
                    <a href="/create" className="h-100">
                        <Card className="scale-btn">
                            <h3>Create a new Wallet</h3>
                            <p>
                                Create your own LUM wallet and generate a private key. This private key is on your own
                                responsability
                            </p>
                        </Card>
                    </a>
                </div>
                <div className="col-md">
                    <a href="/import" className="h-100">
                        <Card className="scale-btn">
                            <h3>Import an existing Wallet</h3>
                            <p>Import your existing LUM Wallet to send tokens, view your rewards and more.</p>
                        </Card>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Welcome;

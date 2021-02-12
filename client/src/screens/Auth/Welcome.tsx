import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { RootState } from 'redux/store';

const Welcome = (): JSX.Element => {
    const address = useSelector((state: RootState) => state.wallet.address);

    if (address) {
        return <Redirect to="/home" />;
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col">
                    <a href="/create">
                        <div>
                            <h3>Create a new Wallet</h3>
                            <p>
                                Create your own LUM wallet and generate a private key. This provate key is on your own
                                responsability
                            </p>
                        </div>
                    </a>
                </div>
                <div className="col">
                    <a href="/import">
                        <div>
                            <h3>Import an ewisting Wallet</h3>
                            <p>Import your existing LUM Wallet to send tokens, view your rewards and more.</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Welcome;

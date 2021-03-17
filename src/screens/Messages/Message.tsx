import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router';

import { AddressCard, BalanceCard } from 'components';
import { RootState } from 'redux/store';
import { Button, Card } from 'frontend-elements';

import './styles/Messages.scss';

const Message = (): JSX.Element => {
    const wallet = useSelector((state: RootState) => state.wallet.currentWallet);

    if (!wallet) {
        return <Redirect to="/welcome" />;
    }

    const currentBalance = useSelector((state: RootState) => state.wallet.currentBalance);
    const [message, setMessage] = useState('');
    const [messageToVerify, setMessageToVerify] = useState('');

    const handleSign = () => {
        // Sign message
    };

    const handleVerify = () => {
        // Verify message
    };

    const onClearVerify = () => {
        // Clear verify input
    };

    const onClearAll = () => {
        // Clear all input
    };

    return (
        <div className="mt-4">
            <div className="container">
                <div className="row gy-4">
                    <div className="col-6">
                        <AddressCard address={wallet.address} />
                    </div>
                    <div className="col-6">
                        <BalanceCard balance={currentBalance} />
                    </div>
                    <div className="col-6">
                        <Card className="d-flex flex-column">
                            <h2>Sign Message</h2>
                            <div className="my-4">
                                Include your nickname and where you use the nickname so someone else cannot use it.
                                Include a specific reason for the message so it cannot be reused for a different
                                purpose.
                            </div>
                            <div>
                                <h4 className="mb-3">Message</h4>
                                <textarea
                                    className="w-100 p-2"
                                    value={message}
                                    rows={10}
                                    onChange={(event) => setMessage(event.target.value)}
                                />
                            </div>
                            <Button className="mx-auto mt-5 px-5" onPress={handleSign}>
                                Sign
                            </Button>
                            <Button className="bg-transparent text-btn mt-2 mx-auto" onPress={onClearAll}>
                                Clear All
                            </Button>
                        </Card>
                    </div>
                    <div className="col-6">
                        <Card className="d-flex flex-column">
                            <h2>Verify Message</h2>
                            <div className="mt-4">
                                <div className="d-flex flex-row justify-content-between mb-2">
                                    <h4>Signature:</h4>
                                    <div className="d-flex flex-row">
                                        <Button onPress={onClearVerify} className="bg-transparent text-btn">
                                            Clear
                                        </Button>
                                        <Button onPress={onClearVerify} className="bg-transparent text-btn">
                                            Copy
                                        </Button>
                                    </div>
                                </div>
                                <textarea
                                    className="w-100 p-2"
                                    value={messageToVerify}
                                    placeholder={`{
    "address": "lum968b882bf30932bebc7b440cc50e489438c4cce",
    "msg": "coucou",
    "sig": "0x0feb1d1d026e2431b437ef7a9a190dc3edacea5de6ef41490212867643c19754424ff7c4ca62ee41cbd6a15d437754887f65c7ff113e3ea2264a4d8911a727b1c",
    "version": "3",
    "signer": "LUMWallet"
}`}
                                    rows={10}
                                    onChange={(event) => setMessageToVerify(event.target.value)}
                                />
                            </div>
                            <Button className="mx-auto mt-5 px-5" onPress={handleVerify}>
                                Verify Message
                            </Button>
                            <Button className="bg-transparent text-btn mt-2 mx-auto" onPress={onClearAll}>
                                Clear All
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Message;

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { RootState } from 'redux/store';
import { Modal } from 'bootstrap';

import { Card } from 'components';

import './Welcome.scss';

const Welcome = (): JSX.Element => {
    const [selectedMethod, setSelectedMethod] = useState('');

    const address = useSelector((state: RootState) => state.wallet.address);

    if (address) {
        return <Redirect to="/home" />;
    }

    const toggleModal = () => {
        const documentModal = document.getElementById('importSoftwareModal');

        if (documentModal) {
            const qrModal = new Modal(documentModal);
            qrModal.toggle();
        }
    };

    const importSoftwareModal = (
        <div
            tabIndex={-1}
            id="importSoftwareModal"
            className="modal fade"
            aria-labelledby="softwareModalLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 rounded-3">
                    <div className="modal-body mx-auto text-center">
                        <p className="not-recommanded">NOT RECOMMANDED</p>
                        <h4>Access by Software</h4>
                        <p>
                            This is not a recommended way to access your wallet, due to the sensitivity of the
                            information involved. These options should only be used in offline settings by experienced
                            users.
                        </p>
                        <div className="d-flex flex-column mb-4">
                            <button
                                type="button"
                                onClick={() => setSelectedMethod('keystore')}
                                className={`import-software-btn ${selectedMethod === 'keystore' && 'selected'}`}
                            >
                                Keystore File
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedMethod('mnemonic')}
                                className={`import-software-btn my-4 ${selectedMethod === 'mnemonic' && 'selected'}`}
                            >
                                Mnemonic phrase
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedMethod('private-key')}
                                className={`import-software-btn ${selectedMethod === 'private-key' && 'selected'}`}
                            >
                                Private Key
                            </button>
                        </div>
                        <p>Purchase a hardware wallet for the highest security when accessing your crypto.</p>
                        <button type="button" className="continue-btn w-100 py-3 rounded-pill">
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="container h-100 d-flex align-items-center justify-content-center">
                <div className="row">
                    <h2 className="text-center mb-4">Access My Wallet</h2>
                    <div>
                        <div className="row gy-4">
                            <div className="col-md">
                                <div className="h-100">
                                    <a href="/import/hardware">
                                        <Card className="text-center scale-btn">
                                            <h3>Hardware</h3>
                                            <p>Ledger, FINNEY, Trezor, Bitbox, Secalot, Keepkey, XWallet</p>
                                        </Card>
                                    </a>
                                </div>
                            </div>
                            <div className="col-md">
                                <button type="button" className="h-100 w-100" onClick={toggleModal}>
                                    <Card className="scale-btn">
                                        <h3>Software</h3>
                                        <p>Keystore file, Private key, Mnemonic phrase</p>
                                    </Card>
                                </button>
                            </div>
                            <div className="col-md">
                                <div className="h-100">
                                    <a href="/create">
                                        <Card className="text-center scale-btn">
                                            <h3>Create a new Wallet</h3>
                                            <p>
                                                Create your own LUM wallet and generate a private key. This private key
                                                is on your own responsability
                                            </p>
                                        </Card>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {importSoftwareModal}
        </>
    );
};

export default Welcome;

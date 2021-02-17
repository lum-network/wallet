import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { RootState } from 'redux/store';
import { Modal as BSModal } from 'bootstrap';

import { Card, KeystoreModal, MnemonicModal, Modal, PrivateKeyModal } from 'components';

import './Welcome.scss';

type MethodModalType = 'mnemonic' | 'privateKey' | 'keystore';

const Welcome = (): JSX.Element => {
    const address = useSelector((state: RootState) => state.wallet.address);

    if (address) {
        return <Redirect to="/home" />;
    }

    const [selectedMethod, setSelectedMethod] = useState<MethodModalType | null>(null);
    const [selectedMethodTemp, setSelectedMethodTemp] = useState<MethodModalType | null>(null);

    // UPDATE MODAL LISTENER
    useEffect(() => {
        const importSoftwareDocumentModal = document.getElementById('importSoftwareModal');

        if (importSoftwareDocumentModal) {
            importSoftwareDocumentModal.addEventListener(
                'hidden.bs.modal',
                () => {
                    if (selectedMethod) {
                        toggleMethodModal(selectedMethod);
                    }
                    setSelectedMethod(null);
                    setSelectedMethodTemp(null);
                },
                { once: true },
            );
        }
    }, [selectedMethod, selectedMethodTemp]);

    const toggleMethodModal = (id: MethodModalType) => {
        const documentElement = document.getElementById(`${id}Modal`);
        if (documentElement) {
            const modalRef = new BSModal(documentElement, { backdrop: 'static' });
            modalRef.toggle();
        }
    };

    // SOFTWARE IMPORT MODALS
    const importSoftwareModal = (
        <Modal id="importSoftwareModal" bodyClassName="px-4" contentClassName="software-modal">
            <p className="not-recommanded">NOT RECOMMANDED</p>
            <h4>Access by Software</h4>
            <p>
                This is not a recommended way to access your wallet, due to the sensitivity of the information involved.
                These options should only be used in offline settings by experienced users.
            </p>
            <div className="d-flex flex-column mb-4">
                <button
                    type="button"
                    onClick={() => setSelectedMethodTemp('keystore')}
                    className={`import-software-btn ${selectedMethodTemp === 'keystore' && 'selected'}`}
                >
                    Keystore File
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedMethodTemp('mnemonic')}
                    className={`import-software-btn my-4 ${selectedMethodTemp === 'mnemonic' && 'selected'}`}
                >
                    Mnemonic phrase
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedMethodTemp('privateKey')}
                    className={`import-software-btn ${selectedMethodTemp === 'privateKey' && 'selected'}`}
                >
                    Private Key
                </button>
            </div>
            <p>Purchase a hardware wallet for the highest security when accessing your crypto.</p>
            <button
                type="button"
                disabled={!selectedMethodTemp}
                onClick={() => setSelectedMethod(selectedMethodTemp)}
                data-bs-dismiss="modal"
                data-bs-target="#importSoftwareModal"
                className="continue-btn w-100 py-3 rounded-pill"
            >
                Continue
            </button>
        </Modal>
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
                                <button
                                    type="button"
                                    className="h-100 w-100"
                                    data-bs-toggle="modal"
                                    data-bs-target="#importSoftwareModal"
                                >
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
            <MnemonicModal />
            <KeystoreModal />
            <PrivateKeyModal />
        </>
    );
};

export default Welcome;

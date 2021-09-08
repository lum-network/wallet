import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Modal as BSModal } from 'bootstrap';

import { RootState } from 'redux/store';

import { Card, Modal, Button } from 'components';
import Assets from 'assets';

import './styles/Auth.scss';

import AuthLayout from './components/AuthLayout';
import ImportMnemonicModal from './components/ImportMnemonicModal';
import ImportPrivateKeyModal from './components/ImportPrivateKeyModal';
import ImportKeystoreModal from './components/ImportKeystoreModal';
import { SoftwareType } from 'models';

const Welcome = (): JSX.Element => {
    // State
    const [selectedMethod, setSelectedMethod] = useState<SoftwareType | null>(null);
    const [keystoreFileData, setKeystoreFileData] = useState<string | null>(null);
    const [importSoftwareModal, setImportSoftwareModal] = useState<BSModal | null>(null);
    const [softwareMethodModal, setSoftwareMethodModal] = useState<BSModal | null>(null);

    // Redux hooks
    const wallet = useSelector((state: RootState) => state.wallet.currentWallet);

    // Refs
    const importSoftwareModalRef = useRef<HTMLDivElement>(null);
    const softwareMethodModalRef = useRef<HTMLDivElement>(null);
    const keystoreInputRef = useRef<HTMLInputElement>(null);

    // Utils hooks
    const { t } = useTranslation();

    // Effects
    const importSoftwareModalHandler = useCallback(() => {
        if (softwareMethodModal && ((selectedMethod === SoftwareType.Keystore && keystoreFileData) || selectedMethod)) {
            softwareMethodModal.show();
        }
    }, [softwareMethodModal, selectedMethod, keystoreFileData]);

    useEffect(() => {
        const currentSoftwareModalRef = importSoftwareModalRef.current;

        if (currentSoftwareModalRef) {
            currentSoftwareModalRef.addEventListener('hidden.bs.modal', importSoftwareModalHandler);
        }

        return () => {
            if (currentSoftwareModalRef) {
                currentSoftwareModalRef.removeEventListener('hidden.bs.modal', importSoftwareModalHandler);
            }
        };
    }, [importSoftwareModalHandler]);

    useEffect(() => {
        if (importSoftwareModalRef.current) {
            setImportSoftwareModal(new BSModal(importSoftwareModalRef.current));
        }
        if (softwareMethodModalRef.current) {
            setSoftwareMethodModal(new BSModal(softwareMethodModalRef.current));
        }
    }, [importSoftwareModalRef, softwareMethodModalRef]);

    useEffect(() => {
        if (wallet) {
            if (softwareMethodModal) {
                softwareMethodModal.dispose();
            }
        }
    }, [softwareMethodModal, wallet]);

    // SOFTWARE IMPORT MODAL
    const importSoftwareModalContent = (
        <Modal
            id="importSoftwareModal"
            ref={importSoftwareModalRef}
            onCloseButtonPress={() => setSelectedMethod(null)}
            bodyClassName="px-4"
            contentClassName="px-3 import-modal-content"
        >
            <p className="not-recommanded">{t('welcome.softwareModal.notRecommanded')}</p>
            <h3 className="mt-4">{t('welcome.softwareModal.title')}</h3>
            <p>{t('welcome.softwareModal.notRecommandedDescription')}</p>
            <div className="d-flex flex-column my-4">
                <button
                    type="button"
                    onClick={() => setSelectedMethod(SoftwareType.Keystore)}
                    className={`import-software-btn ${selectedMethod === SoftwareType.Keystore && 'selected'}`}
                >
                    <div className="d-flex align-items-center justify-content-center">
                        <img src={Assets.images.softwareIcon} height="28" className="me-3" />
                        {t('welcome.softwareModal.types.keystore')}
                    </div>
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedMethod(SoftwareType.Mnemonic)}
                    className={`import-software-btn my-4 ${selectedMethod === SoftwareType.Mnemonic && 'selected'}`}
                >
                    <div className="d-flex align-items-center justify-content-center">
                        <img src={Assets.images.bubbleIcon} height="28" className="me-3" />
                        {t('welcome.softwareModal.types.mnemonic')}
                    </div>
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedMethod(SoftwareType.PrivateKey)}
                    className={`import-software-btn ${selectedMethod === SoftwareType.PrivateKey && 'selected'}`}
                >
                    <div className="d-flex align-items-center justify-content-center">
                        <img src={Assets.images.keyIcon} height="28" className="me-3" />
                        {t('welcome.softwareModal.types.privateKey')}
                    </div>
                </button>
            </div>
            <p>{t('welcome.softwareModal.description')}</p>
            <Button
                type="button"
                disabled={!selectedMethod}
                onClick={() => {
                    if (selectedMethod === SoftwareType.Keystore) {
                        if (keystoreInputRef.current) {
                            keystoreInputRef.current.click();
                        }
                    } else {
                        importSoftwareModal?.hide();
                    }
                }}
                className="my-4 w-100"
            >
                {t('common.continue')}
            </Button>
            {selectedMethod === SoftwareType.Keystore && (
                <input
                    id="keystore-input"
                    ref={keystoreInputRef}
                    type="file"
                    hidden
                    accept=".json"
                    onChange={(event) => {
                        if (event.target.files && event.target.files.length > 0) {
                            event.target.files[0].text().then((data) => {
                                setKeystoreFileData(data);
                                importSoftwareModal?.hide();
                            });
                        }
                    }}
                />
            )}
        </Modal>
    );

    const importHardwareModalContent = (
        <Modal id="importHardwareModal" bodyClassName="p-5">
            <h2>Coming Soon...</h2>
        </Modal>
    );

    if (wallet) {
        return <Redirect to="/home" />;
    }

    return (
        <>
            <AuthLayout>
                <div className="container mb-4">
                    <div className="mb-4rem">
                        <h1 className="text-center display-5">{t('welcome.title')}</h1>
                    </div>
                    <div className="row justify-content-center gy-4">
                        <div className="col-12 col-lg-3">
                            <a
                                role="button"
                                data-bs-toggle="modal"
                                data-bs-target="#importHardwareModal"
                                className="text-reset text-decoration-none"
                            >
                                <Card className="auth-card scale-anim text-center btn-padding h-100 w-100">
                                    <img
                                        src={Assets.images.hardwareIcon}
                                        className="img-fluid mb-3"
                                        alt="Harware Icon"
                                        width="90"
                                        height="90"
                                    />
                                    <h3 className="mt-4">{t('welcome.hardware.title')}</h3>
                                    <p>{t('welcome.hardware.description')}</p>
                                    <br />
                                    <p>COMING SOON</p>
                                </Card>
                            </a>
                        </div>
                        <div className="col-12 col-lg-3">
                            <Button
                                buttonType="custom"
                                onClick={() => {
                                    setSelectedMethod(null);
                                    importSoftwareModal?.show();
                                }}
                                className="h-100 w-100 text-reset text-decoration-none"
                            >
                                <Card className="auth-card scale-anim text-center btn-padding h-100 w-100">
                                    <img
                                        src={Assets.images.softwareIcon}
                                        className="img-fluid mb-4"
                                        alt="Software Icon"
                                        width="57"
                                        height="76"
                                    />
                                    <h3 className="mt-4">{t('welcome.software.title')}</h3>
                                    <p>{t('welcome.software.description')}</p>
                                    <p className="not-recommanded">{t('welcome.softwareModal.notRecommanded')}</p>
                                </Card>
                            </Button>
                        </div>
                        <div className="col-12 col-lg-3">
                            <Link to="/create" className="text-reset text-decoration-none">
                                <div className="scale-anim btn-padding h-100 w-100 text-center d-flex align-items-center flex-column justify-content-evenly">
                                    <div className="create-btn rounded-circle mb-4 mb-lg-0 d-flex justify-content-center align-items-center">
                                        <img className="img-fluid" src={Assets.images.addIcon} width="27" height="27" />
                                    </div>
                                    <h3>{t('welcome.createWallet')}</h3>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </AuthLayout>
            {importSoftwareModalContent}
            {importHardwareModalContent}
            <Modal id="softwareMethodModal" ref={softwareMethodModalRef}>
                {selectedMethod === SoftwareType.Mnemonic && <ImportMnemonicModal />}
                {selectedMethod === SoftwareType.PrivateKey && <ImportPrivateKeyModal />}
                {selectedMethod === SoftwareType.Keystore && keystoreFileData && (
                    <ImportKeystoreModal fileData={keystoreFileData} onSubmit={() => softwareMethodModal?.hide()} />
                )}
            </Modal>
        </>
    );
};

export default Welcome;

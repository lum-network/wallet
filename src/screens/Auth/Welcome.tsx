import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Modal as BSModal } from 'bootstrap';
import { Window as KeplrWindow } from '@keplr-wallet/types';

import { RootDispatch, RootState } from 'redux/store';

import { Modal, Button } from 'components';
import Assets from 'assets';

import './styles/Auth.scss';

import AuthLayout from './components/AuthLayout';
import ImportMnemonicModal from './components/ImportMnemonicModal';
import ImportPrivateKeyModal from './components/ImportPrivateKeyModal';
import ImportKeystoreModal from './components/ImportKeystoreModal';
import { ExtensionMethod, HardwareMethod, SoftwareMethod } from 'models';
import { useRematchDispatch } from 'redux/hooks';
import ImportButton from './components/ImportButton';
import { usePrevious } from 'utils';

interface ImportType {
    type: 'software' | 'extension' | 'hardware';
    method: SoftwareMethod | HardwareMethod | ExtensionMethod | null;
}

const Welcome = (): JSX.Element => {
    // State
    const [selectedMethod, setSelectedMethod] = useState<ImportType | null>(null);
    const [keystoreFileData, setKeystoreFileData] = useState<string | null>(null);
    const [importSoftwareModal, setImportSoftwareModal] = useState<BSModal | null>(null);
    const [softwareMethodModal, setSoftwareMethodModal] = useState<BSModal | null>(null);

    // Redux hooks
    const { wallet, isSigningWithKeplr, isSigningWithLedger } = useSelector((state: RootState) => ({
        wallet: state.wallet.currentWallet,
        isSigningWithKeplr: state.loading.effects.wallet.signInWithKeplrAsync,
        isSigningWithLedger: state.loading.effects.wallet.signInWithLedgerAsync,
    }));

    const { signInWithKeplr, signInWithLedger } = useRematchDispatch((dispatch: RootDispatch) => ({
        signInWithKeplr: dispatch.wallet.signInWithKeplrAsync,
        signInWithLedger: dispatch.wallet.signInWithLedgerAsync,
    }));

    const prevIsSigningWithLedger = usePrevious(isSigningWithLedger);

    // Refs
    const importSoftwareModalRef = useRef<HTMLDivElement>(null);
    const softwareMethodModalRef = useRef<HTMLDivElement>(null);
    const keystoreInputRef = useRef<HTMLInputElement>(null);

    // Utils hooks
    const { t } = useTranslation();

    // Callbacks
    const importSoftwareModalHandler = useCallback(() => {
        if (
            softwareMethodModal &&
            selectedMethod &&
            !isSigningWithKeplr &&
            ((selectedMethod.method && selectedMethod.method === SoftwareMethod.Keystore && keystoreFileData) ||
                selectedMethod.method)
        ) {
            softwareMethodModal.show();
        }
    }, [softwareMethodModal, selectedMethod, keystoreFileData, isSigningWithKeplr]);

    // Effects
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
            setImportSoftwareModal(
                new BSModal(importSoftwareModalRef.current, { backdrop: 'static', keyboard: false }),
            );
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
            if (importSoftwareModal) {
                importSoftwareModal.dispose();
            }
        }
    }, [softwareMethodModal, importSoftwareModal, wallet]);

    useEffect(() => {
        if (prevIsSigningWithLedger && !isSigningWithLedger && wallet) {
            importSoftwareModal?.hide();
        }
    }, [prevIsSigningWithLedger, isSigningWithLedger, wallet, importSoftwareModal]);

    const renderImportTypeModal = () => {
        if (!selectedMethod) {
            return null;
        }

        const isKeplrInstalled = !!(window as KeplrWindow).getOfflineSigner && !!(window as KeplrWindow).keplr;

        switch (selectedMethod.type) {
            case 'software':
                return (
                    <>
                        <p className="not-recommended">{t('welcome.softwareModal.notRecommended')}</p>
                        <h3 className="mt-4">{t('welcome.softwareModal.title')}</h3>
                        <p className="auth-paragraph">{t('welcome.softwareModal.notRecommendedDescription')}</p>
                        <div className="d-flex flex-column my-5">
                            <button
                                type="button"
                                onClick={() => setSelectedMethod({ type: 'software', method: SoftwareMethod.Keystore })}
                                className={`import-software-btn ${
                                    selectedMethod?.method === SoftwareMethod.Keystore && 'selected'
                                }`}
                            >
                                <div className="d-flex align-items-center justify-content-center">
                                    <img src={Assets.images.softwareIcon} height="28" className="me-3" />
                                    {t('welcome.softwareModal.types.keystore')}
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedMethod({ type: 'software', method: SoftwareMethod.Mnemonic })}
                                className={`import-software-btn my-4 ${
                                    selectedMethod?.method === SoftwareMethod.Mnemonic && 'selected'
                                }`}
                            >
                                <div className="d-flex align-items-center justify-content-center">
                                    <img src={Assets.images.bubbleIcon} height="28" className="me-3" />
                                    {t('welcome.softwareModal.types.mnemonic')}
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedMethod({ type: 'software', method: SoftwareMethod.PrivateKey })
                                }
                                className={`import-software-btn ${
                                    selectedMethod?.method === SoftwareMethod.PrivateKey && 'selected'
                                }`}
                            >
                                <div className="d-flex align-items-center justify-content-center">
                                    <img src={Assets.images.keyIcon} height="28" className="me-3" />
                                    {t('welcome.softwareModal.types.privateKey')}
                                </div>
                            </button>
                        </div>
                        <p className="auth-paragraph">{t('welcome.softwareModal.description')}</p>
                        <Button
                            type="button"
                            disabled={!selectedMethod.method}
                            onClick={() => {
                                if (selectedMethod?.method === SoftwareMethod.Keystore) {
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
                        {selectedMethod?.method === SoftwareMethod.Keystore && (
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
                    </>
                );
            case 'extension':
                return (
                    <>
                        <p className="recommended">{t('welcome.extensionModal.info')}</p>
                        <h3 className="mt-4">{t('welcome.extensionModal.title')}</h3>
                        <p className="auth-paragraph mb-2">{t('welcome.extensionModal.description')}</p>
                        <div className="d-flex flex-column my-5">
                            <button
                                type="button"
                                onClick={() => setSelectedMethod({ type: 'extension', method: ExtensionMethod.Keplr })}
                                className={`import-software-btn ${
                                    selectedMethod?.method === ExtensionMethod.Keplr && 'selected'
                                }`}
                            >
                                <div className="d-flex align-items-center justify-content-center">
                                    <img src={Assets.images.softwareIcon} height="28" className="me-3" />
                                    Keplr extension
                                </div>
                            </button>
                        </div>
                        {!isKeplrInstalled && <p className="not-recommended">{t('welcome.extensionModal.note')}</p>}
                        <Button
                            type="button"
                            disabled={!selectedMethod.method || !isKeplrInstalled}
                            isLoading={isSigningWithKeplr}
                            onClick={() => {
                                if (
                                    selectedMethod &&
                                    selectedMethod.method &&
                                    selectedMethod.method === ExtensionMethod.Keplr
                                ) {
                                    signInWithKeplr();
                                }
                                importSoftwareModal?.hide();
                            }}
                            className="my-4 w-100"
                        >
                            {t('common.continue')}
                        </Button>
                    </>
                );
            case 'hardware':
                return (
                    <>
                        {!isSigningWithLedger ? (
                            <>
                                <h3 className="mt-4">{t('welcome.hardwareModal.title')}</h3>
                                <p className="auth-paragraph mb-2">{t('welcome.hardwareModal.description')}</p>
                                <div className="d-flex flex-column my-5">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedMethod({ type: 'hardware', method: HardwareMethod.Ledger })
                                        }
                                        className={`import-software-btn ${
                                            selectedMethod?.method === HardwareMethod.Ledger && 'selected'
                                        }`}
                                    >
                                        <div className="d-flex align-items-center justify-content-center">
                                            <img src={Assets.images.ledgerIcon} height="28" className="me-3" />
                                            {t('welcome.hardwareModal.types.ledger')}
                                        </div>
                                    </button>
                                </div>
                                <p className="not-recommended">{t('welcome.hardwareModal.note')}</p>
                                <Button
                                    type="button"
                                    disabled={!selectedMethod.method || !isKeplrInstalled}
                                    isLoading={isSigningWithLedger}
                                    onClick={() => {
                                        if (
                                            selectedMethod &&
                                            selectedMethod.method &&
                                            selectedMethod.method === HardwareMethod.Ledger
                                        ) {
                                            signInWithLedger();
                                        }
                                    }}
                                    className="my-4 w-100"
                                >
                                    {t('common.continue')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <h3 className="mt-4">Waiting for your Ledger</h3>
                                <p className="auth-paragraph">Connecting to your Ledger</p>
                            </>
                        )}
                    </>
                );
            default:
                return <h2>Coming Soon...</h2>;
        }
    };

    const renderSoftwareImportModalContent = () => {
        if (!selectedMethod || (selectedMethod && selectedMethod.type !== 'software')) {
            return null;
        }

        switch (selectedMethod.method) {
            case SoftwareMethod.Mnemonic:
                return <ImportMnemonicModal />;
            case SoftwareMethod.PrivateKey:
                return <ImportPrivateKeyModal />;
            case SoftwareMethod.Keystore:
                return keystoreFileData ? (
                    <ImportKeystoreModal fileData={keystoreFileData} onSubmit={() => softwareMethodModal?.hide()} />
                ) : (
                    <div />
                );
        }
    };

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
                            <ImportButton
                                method="extension"
                                disabled={isSigningWithKeplr}
                                title={t('welcome.extension.title')}
                                description={t('welcome.extension.description')}
                                note={t('welcome.extensionModal.info')}
                                icon={Assets.images.extensionIcon}
                                onClick={() => setSelectedMethod({ type: 'extension', method: null })}
                            />
                        </div>
                        <div className="col-12 col-lg-3">
                            <ImportButton
                                method="hardware"
                                disabled={isSigningWithKeplr}
                                title={t('welcome.hardware.title')}
                                description={t('welcome.hardware.description')}
                                note={t('welcome.extensionModal.info')}
                                icon={Assets.images.hardwareIcon}
                                onClick={() => setSelectedMethod({ type: 'hardware', method: null })}
                            />
                        </div>
                        <div className="col-12 col-lg-3">
                            <ImportButton
                                method="software"
                                disabled={isSigningWithKeplr}
                                title={t('welcome.software.title')}
                                description={t('welcome.software.description')}
                                note={t('welcome.softwareModal.notRecommended')}
                                icon={Assets.images.softwareIcon}
                                iconWidth="57"
                                iconHeight="76"
                                onClick={() => setSelectedMethod({ type: 'software', method: null })}
                            />
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
            <Modal
                id="importSoftwareModal"
                ref={importSoftwareModalRef}
                onCloseButtonPress={() => setTimeout(() => setSelectedMethod(null), 300)}
                bodyClassName="px-4"
                contentClassName="px-3 import-modal-content"
            >
                {renderImportTypeModal()}
            </Modal>
            <Modal id="softwareMethodModal" ref={softwareMethodModalRef}>
                {renderSoftwareImportModalContent()}
            </Modal>
            {isSigningWithKeplr && <div className="w-100 h-100 position-absolute opacity-50 bg-black on-top" />}
        </>
    );
};

export default Welcome;

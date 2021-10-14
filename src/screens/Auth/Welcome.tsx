import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Modal as BSModal } from 'bootstrap';
import { Window as KeplrWindow } from '@keplr-wallet/types';

import { RootDispatch, RootState } from 'redux/store';

import Assets from 'assets';
import { COSMOS_LEDGER_APP_INSTALL_LINK, LUM_LEDGER_APP_INSTALL_LINK } from 'constant';
import { Modal, Button } from 'components';
import { ExtensionMethod, HardwareMethod, SoftwareMethod } from 'models';
import { useRematchDispatch } from 'redux/hooks';

import './styles/Auth.scss';

import AuthLayout from './components/AuthLayout';
import ImportMnemonicModal from './components/ImportMnemonicModal';
import ImportPrivateKeyModal from './components/ImportPrivateKeyModal';
import ImportKeystoreModal from './components/ImportKeystoreModal';
import ImportButton from './components/ImportButton';

interface ImportType {
    type: 'software' | 'extension' | 'hardware';
    method: SoftwareMethod | HardwareMethod | ExtensionMethod | null;
}

const Welcome = (): JSX.Element => {
    // State
    const [selectedMethod, setSelectedMethod] = useState<ImportType | null>(null);
    const [keystoreFileData, setKeystoreFileData] = useState<string | null>(null);
    const [softwareMethodModal, setSoftwareMethodModal] = useState<BSModal | null>(null);
    const [modalShowed, setModalShowed] = useState(false);

    // Redux hooks
    const { wallet, keplrState, ledgerState } = useSelector((state: RootState) => ({
        wallet: state.wallet.currentWallet,
        keplrState: state.loading.effects.wallet.signInWithKeplrAsync,
        ledgerState: state.loading.effects.wallet.signInWithLedgerAsync,
    }));

    const { signInWithKeplr, signInWithLedger } = useRematchDispatch((dispatch: RootDispatch) => ({
        signInWithKeplr: dispatch.wallet.signInWithKeplrAsync,
        signInWithLedger: dispatch.wallet.signInWithLedgerAsync,
    }));

    // Refs
    const importSoftwareModalRef = useRef<HTMLDivElement>(null);
    const softwareMethodModalRef = useRef<HTMLDivElement>(null);
    const keystoreInputRef = useRef<HTMLInputElement>(null);

    // Utils hooks
    const { t } = useTranslation();
    const history = useHistory();

    // Callbacks
    const showImportModal = useCallback(() => {
        const modalElement = importSoftwareModalRef.current;

        if (modalElement) {
            const bsModal = BSModal.getOrCreateInstance(modalElement, { backdrop: 'static', keyboard: false });
            bsModal.show();
            setModalShowed(true);
        }
    }, [importSoftwareModalRef]);

    const hideImportModal = useCallback(() => {
        const modalElement = importSoftwareModalRef.current;

        if (modalElement) {
            const bsModal = BSModal.getOrCreateInstance(modalElement, { backdrop: 'static', keyboard: false });
            bsModal.hide();
            setModalShowed(false);
        }
    }, [importSoftwareModalRef]);

    // Effects
    useEffect(() => {
        if (wallet) {
            if (modalShowed) {
                hideImportModal();
                // 300ms is the modal transition duration
                setTimeout(() => history.replace('/home'), 300);
            } else {
                history.replace('/home');
            }
        }
    }, [wallet, history, modalShowed, hideImportModal]);

    useEffect(() => {
        if (softwareMethodModalRef.current) {
            setSoftwareMethodModal(BSModal.getOrCreateInstance(softwareMethodModalRef.current));
        }
    }, [softwareMethodModalRef]);

    useEffect(() => {
        const modalElement = importSoftwareModalRef.current;

        const importSoftwareModalHandler = () => {
            if (
                softwareMethodModal &&
                selectedMethod &&
                selectedMethod.type === 'software' &&
                ((selectedMethod.method && selectedMethod.method === SoftwareMethod.Keystore && keystoreFileData) ||
                    selectedMethod.method)
            ) {
                softwareMethodModal.show();
            }
        };

        if (modalElement) {
            modalElement.addEventListener('hidden.bs.modal', importSoftwareModalHandler);
        }

        return () => {
            if (modalElement) {
                modalElement.removeEventListener('hidden.bs.modal', importSoftwareModalHandler);
            }
        };
    }, [history, keystoreFileData, selectedMethod, softwareMethodModal, wallet]);

    const renderImportTypeModalContent = () => {
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
                                    hideImportModal();
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
                                            hideImportModal();
                                        });
                                    }
                                }}
                            />
                        )}
                    </>
                );
            case 'extension':
                return keplrState.loading ? (
                    <>
                        <h3 className="mt-4">
                            {t('welcome.extensionModalLoading.title', {
                                extension: selectedMethod.method
                                    ? selectedMethod.method[0].toUpperCase() + selectedMethod.method.slice(1)
                                    : 'Null',
                            })}
                        </h3>
                        <p className="auth-paragraph">
                            {t('welcome.extensionModalLoading.description', {
                                app: selectedMethod.method
                                    ? selectedMethod.method[0].toUpperCase() + selectedMethod.method.slice(1)
                                    : 'Null',
                            })}
                        </p>
                        <div className="spinner-border spinner my-4" role="extension import status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </>
                ) : (
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
                                    <img src={Assets.images.keplrIcon} height="28" className="me-3" />
                                    Keplr extension
                                </div>
                            </button>
                        </div>
                        {!isKeplrInstalled && <p className="not-recommended">{t('welcome.extensionModal.note')}</p>}
                        <Button
                            type="button"
                            disabled={!selectedMethod.method || !isKeplrInstalled}
                            isLoading={keplrState.loading}
                            onClick={() => {
                                if (
                                    selectedMethod &&
                                    selectedMethod.method &&
                                    selectedMethod.method === ExtensionMethod.Keplr
                                ) {
                                    signInWithKeplr().catch(() => null);
                                }
                            }}
                            className="my-4 w-100"
                        >
                            {t('common.continue')}
                        </Button>
                    </>
                );
            case 'hardware':
                return !ledgerState.loading ? (
                    <>
                        <h3 className="mt-4">{t('welcome.hardwareModal.title')}</h3>
                        <p className="auth-paragraph mb-2">{t('welcome.hardwareModal.description')}</p>
                        <div className="d-flex flex-column my-5">
                            <button
                                type="button"
                                onClick={() => setSelectedMethod({ type: 'hardware', method: HardwareMethod.Cosmos })}
                                className={`import-software-btn ${
                                    selectedMethod?.method === HardwareMethod.Cosmos && 'selected'
                                }`}
                            >
                                <div className="d-flex align-items-center justify-content-center">
                                    <img src={Assets.images.cosmosIcon} height="28" className="me-3" />
                                    {t('welcome.hardwareModal.types.cosmos')}
                                </div>
                            </button>
                            <a
                                className="align-self-center mt-2"
                                href={COSMOS_LEDGER_APP_INSTALL_LINK}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <small>
                                    <u>
                                        {t('welcome.hardwareModal.howTo', {
                                            app: t('welcome.hardwareModal.types.cosmos'),
                                        })}
                                    </u>
                                </small>
                            </a>
                            <button
                                type="button"
                                disabled
                                onClick={() => setSelectedMethod({ type: 'hardware', method: HardwareMethod.Lum })}
                                className={`import-software-btn mt-4 ${
                                    selectedMethod?.method === HardwareMethod.Lum && 'selected'
                                }`}
                            >
                                <div className="d-flex align-items-center justify-content-center">
                                    <img src={Assets.images.lumLogo} height="28" className="me-3" />
                                    {t('welcome.hardwareModal.types.lum')} (Coming soon)
                                </div>
                            </button>
                            <a
                                className="align-self-center mt-2"
                                href={LUM_LEDGER_APP_INSTALL_LINK}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <small>
                                    <u>
                                        {t('welcome.hardwareModal.howTo', {
                                            app: t('welcome.hardwareModal.types.lum'),
                                        })}
                                    </u>
                                </small>
                            </a>
                        </div>
                        <p className="not-recommended">{t('welcome.hardwareModal.note')}</p>
                        <Button
                            type="button"
                            disabled={!selectedMethod.method}
                            isLoading={ledgerState.loading}
                            onClick={() => {
                                if (
                                    selectedMethod &&
                                    selectedMethod.method &&
                                    (selectedMethod.method === HardwareMethod.Cosmos ||
                                        selectedMethod.method === HardwareMethod.Lum)
                                ) {
                                    signInWithLedger(selectedMethod.method).catch(() => null);
                                }
                            }}
                            className="my-4 w-100"
                        >
                            {t('common.continue')}
                        </Button>
                    </>
                ) : (
                    <>
                        <h3 className="mt-4">{t('welcome.hardwareModalLoading.title')}</h3>
                        <p className="auth-paragraph">
                            {t('welcome.hardwareModalLoading.description', {
                                app: selectedMethod.method
                                    ? selectedMethod.method[0].toUpperCase() + selectedMethod.method.slice(1)
                                    : 'Null',
                            })}
                        </p>
                        <div className="spinner-border spinner my-4" role="ledger import status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
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
                                disabled={keplrState.loading || ledgerState.loading}
                                title={t('welcome.extension.title')}
                                description={t('welcome.extension.description')}
                                note={t('welcome.extensionModal.info')}
                                icon={Assets.images.extensionIcon}
                                onClick={() => {
                                    showImportModal();
                                    setSelectedMethod({ type: 'extension', method: null });
                                }}
                            />
                        </div>
                        <div className="col-12 col-lg-3">
                            <ImportButton
                                method="hardware"
                                disabled={keplrState.loading || ledgerState.loading}
                                title={t('welcome.hardware.title')}
                                description={t('welcome.hardware.description')}
                                note=""
                                icon={Assets.images.hardwareIcon}
                                onClick={() => {
                                    showImportModal();
                                    setSelectedMethod({ type: 'hardware', method: null });
                                }}
                            />
                        </div>
                        <div className="col-12 col-lg-3">
                            <ImportButton
                                method="software"
                                disabled={keplrState.loading || ledgerState.loading}
                                title={t('welcome.software.title')}
                                description={t('welcome.software.description')}
                                note={t('welcome.softwareModal.notRecommended')}
                                icon={Assets.images.softwareIcon}
                                iconWidth="57"
                                iconHeight="76"
                                onClick={() => {
                                    showImportModal();
                                    setSelectedMethod({ type: 'software', method: null });
                                }}
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
                withCloseButton={!ledgerState.loading && !keplrState.loading}
                onCloseButtonPress={() => setTimeout(() => setSelectedMethod(null), 300)}
                bodyClassName="px-4"
                contentClassName="px-3 import-modal-content"
            >
                {renderImportTypeModalContent()}
            </Modal>
            <Modal id="softwareMethodModal" ref={softwareMethodModalRef}>
                {renderSoftwareImportModalContent()}
            </Modal>
        </>
    );
};

export default Welcome;

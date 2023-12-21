import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Window as KeplrWindow } from '@keplr-wallet/types';
import { Button as FEButton } from 'frontend-elements';
import { RootDispatch, RootState } from 'redux/store';

import Assets from 'assets';
import { COSMOS_LEDGER_APP_INSTALL_LINK, KEPLR_DEFAULT_COIN_TYPE, KEPLR_INSTALL_LINK, LumConstants } from 'constant';
import { Modal, Button, SwitchInput, Input, HdPathInput, HoverTooltip } from 'components';
import { ExtensionMethod, HardwareMethod, SoftwareMethod } from 'models';
import { useRematchDispatch } from 'redux/hooks';

import AuthLayout from './components/AuthLayout';
import ImportMnemonicModal from './components/modals/ImportMnemonicModal';
import ImportPrivateKeyModal from './components/modals/ImportPrivateKeyModal';
import ImportKeystoreModal from './components/modals/ImportKeystoreModal';
import ImportGuardaModal from './components/modals/ImportGuardaModal';
import ImportButton from './components/ImportButton';

import './styles/Auth.scss';

interface ImportType {
    type: 'software' | 'extension' | 'hardware';
    method: SoftwareMethod | HardwareMethod | ExtensionMethod | null;
}

const Welcome = (): JSX.Element => {
    // State
    const [selectedMethod, setSelectedMethod] = useState<ImportType | null>(null);
    const [keystoreFileData, setKeystoreFileData] = useState<string | null>(null);
    const [softwareMethodModal, setSoftwareMethodModal] = useState<React.ElementRef<typeof Modal> | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [customHdPath, setCustomHdPath] = useState(LumConstants.getLumHdPath());
    const [isCustomPathValid, setIsCustomPathValid] = useState(true);
    const [isCustomCoinTypeValid, setIsCustomCoinTypeValid] = useState(true);
    const [keplrCoinType, setKeplrCoinType] = useState(KEPLR_DEFAULT_COIN_TYPE);
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
    const importSoftwareModalRef = useRef<React.ElementRef<typeof Modal>>(null);
    const softwareMethodModalRef = useRef<React.ElementRef<typeof Modal>>(null);
    const keystoreInputRef = useRef<HTMLInputElement>(null);

    // Utils hooks
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Callbacks
    const showImportModal = useCallback(() => {
        const modalElement = importSoftwareModalRef.current;

        if (modalElement) {
            modalElement.show();
            setModalShowed(true);
        }
    }, [importSoftwareModalRef]);

    const hideImportModal = useCallback(() => {
        const modalElement = importSoftwareModalRef.current;

        if (modalElement) {
            modalElement.hide();
            setModalShowed(false);
        }
    }, [importSoftwareModalRef]);

    // Effects
    useEffect(() => {
        if (wallet) {
            if (modalShowed) {
                hideImportModal();
                // 300ms is the modal transition duration
                setTimeout(() => navigate('/home', { replace: true }), 300);
            } else {
                navigate('/home', { replace: true });
            }
        }
    }, [wallet]);

    useEffect(() => {
        if (softwareMethodModalRef.current) {
            setSoftwareMethodModal(softwareMethodModalRef.current);
        }
    }, [softwareMethodModalRef]);

    useEffect(() => {
        const modalElement = importSoftwareModalRef.current;

        const importSoftwareModalHandler = () => {
            setShowAdvanced(false);
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
    }, [selectedMethod]);

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
                                <p className="d-flex align-items-center justify-content-center fw-normal">
                                    <img src={Assets.images.softwareIcon} height="28" className="me-3" />
                                    {t('welcome.softwareModal.types.keystore')}
                                </p>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedMethod({ type: 'software', method: SoftwareMethod.PrivateKey })
                                }
                                className={`import-software-btn my-4 ${
                                    selectedMethod?.method === SoftwareMethod.PrivateKey && 'selected'
                                }`}
                            >
                                <p className="d-flex align-items-center justify-content-center fw-normal">
                                    <img src={Assets.images.keyIcon} height="28" className="me-3" />
                                    {t('welcome.softwareModal.types.privateKey')}
                                </p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedMethod({ type: 'software', method: SoftwareMethod.Mnemonic })}
                                className={`import-software-btn ${
                                    selectedMethod?.method === SoftwareMethod.Mnemonic && 'selected'
                                }`}
                            >
                                <p className="d-flex align-items-center justify-content-center fw-normal">
                                    <img src={Assets.images.navbarIcons.messages} height="28" className="me-3" />
                                    {t('welcome.softwareModal.types.mnemonic')}
                                </p>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedMethod({
                                        type: 'software',
                                        method: SoftwareMethod.Guarda,
                                    })
                                }
                                className={`import-software-btn mt-4 ${
                                    selectedMethod?.method === SoftwareMethod.Guarda && 'selected'
                                }`}
                            >
                                <p className="d-flex fw-normal align-items-center justify-content-center">
                                    <img src={Assets.images.guardaIcon} height="28" className="me-3" />
                                    {t('welcome.softwareModal.types.guardaBackup')}
                                </p>
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
                                extension: selectedMethod.method
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
                                onClick={() =>
                                    isKeplrInstalled
                                        ? setSelectedMethod({ type: 'extension', method: ExtensionMethod.Keplr })
                                        : window.open(KEPLR_INSTALL_LINK, '_blank')
                                }
                                className={`import-software-btn ${
                                    selectedMethod?.method === ExtensionMethod.Keplr && 'selected'
                                }`}
                            >
                                <p className="d-flex fw-normal align-items-center justify-content-center">
                                    <img src={Assets.images.keplrIcon} height="28" className="me-3" />
                                    {t('welcome.extensionModal.types.keplr.title')}
                                </p>
                            </button>
                        </div>
                        {!isKeplrInstalled ? (
                            <p className="not-recommended">
                                <Trans
                                    t={t}
                                    components={{
                                        u: (
                                            <u
                                                onClick={() => window.open(KEPLR_INSTALL_LINK, '_blank')}
                                                style={{ cursor: 'pointer', color: '#f3b265' }}
                                            />
                                        ),
                                    }}
                                    i18nKey="welcome.extensionModal.types.keplr.notInstalled"
                                />
                            </p>
                        ) : (
                            <>
                                <div className="d-flex flex-row justify-content-between align-self-stretch align-items-center my-4">
                                    <p className="p-0 m-0">
                                        {t('common.advanced')}
                                        <span className="ms-2">
                                            <HoverTooltip text={t('common.advancedTooltip')}>
                                                <img src={Assets.images.warningHoverIcon} />
                                            </HoverTooltip>
                                        </span>
                                    </p>
                                    <SwitchInput
                                        checked={showAdvanced}
                                        onChange={(event) => setShowAdvanced(event.target.checked)}
                                    />
                                </div>
                                {showAdvanced && (
                                    <div className="mb-4rem">
                                        <h4 className="mb-3">
                                            {t('welcome.extensionModal.types.keplr.advanced.title')}
                                        </h4>
                                        <Input
                                            defaultValue={KEPLR_DEFAULT_COIN_TYPE}
                                            type="number"
                                            min="0"
                                            onChange={(event) => {
                                                const newCoinType = Number(event.target.value);

                                                setKeplrCoinType(newCoinType);
                                                setIsCustomCoinTypeValid(!Number.isNaN(newCoinType) && newCoinType > 0);
                                            }}
                                        />
                                        <p
                                            className="pt-3 not-recommended"
                                            dangerouslySetInnerHTML={{
                                                __html: t('welcome.extensionModal.types.keplr.advanced.description'),
                                            }}
                                        ></p>
                                    </div>
                                )}
                            </>
                        )}
                        <Button
                            type="button"
                            disabled={
                                !selectedMethod.method || !isKeplrInstalled || (showAdvanced && !isCustomCoinTypeValid)
                            }
                            isLoading={keplrState.loading}
                            onClick={() => {
                                if (
                                    selectedMethod &&
                                    selectedMethod.method &&
                                    selectedMethod.method === ExtensionMethod.Keplr
                                ) {
                                    signInWithKeplr(keplrCoinType).catch(() => null);
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
                        <div className="d-flex flex-column mt-5">
                            <button
                                type="button"
                                onClick={() => setSelectedMethod({ type: 'hardware', method: HardwareMethod.Cosmos })}
                                className={`import-software-btn ${
                                    selectedMethod?.method === HardwareMethod.Cosmos && 'selected'
                                }`}
                            >
                                <p className="d-flex align-items-center justify-content-center fw-normal">
                                    <img src={Assets.images.cosmosIcon} height="28" className="me-3" />
                                    {t('welcome.hardwareModal.types.cosmos')}
                                </p>
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
                                <p className="d-flex align-items-center justify-content-center fw-normal">
                                    <img src={Assets.images.lumLogo} height="28" className="me-3" />
                                    {t('welcome.hardwareModal.types.lum')} (Coming soon)
                                </p>
                            </button>
                            {/* 
                                DEACTIVATED -> Waiting for Lum ledger app release
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
                            </a> */}
                            <div className="d-flex flex-row justify-content-between align-self-stretch align-items-center my-4">
                                <p className="p-0 m-0">
                                    {t('common.advanced')}
                                    <span className="ms-2">
                                        <HoverTooltip text={t('common.advancedTooltip')}>
                                            <img src={Assets.images.warningHoverIcon} />
                                        </HoverTooltip>
                                    </span>
                                </p>
                                <SwitchInput
                                    checked={showAdvanced}
                                    onChange={(event) => setShowAdvanced(event.target.checked)}
                                />
                            </div>
                            {showAdvanced && (
                                <div className="mb-4rem">
                                    <div className="d-flex flex-row justify-content-between align-items-center mb-3">
                                        <h4>{t('welcome.hardwareModal.advanced.title')}</h4>
                                        <FEButton
                                            onPress={() => {
                                                setCustomHdPath(LumConstants.getLumHdPath());
                                            }}
                                            className="bg-transparent text-btn p-0 me-2 h-auto"
                                        >
                                            {t('common.reset')}
                                        </FEButton>
                                    </div>
                                    <HdPathInput
                                        value={customHdPath}
                                        onChange={(value) => setCustomHdPath(value)}
                                        onCheck={(valid) => setIsCustomPathValid(valid)}
                                    />
                                    <p className="auth-paragraph">{t('welcome.hardwareModal.advanced.description')}</p>
                                </div>
                            )}
                        </div>
                        <p className="not-recommended">{t('welcome.hardwareModal.note')}</p>
                        <Button
                            type="button"
                            disabled={!selectedMethod.method || (showAdvanced && !isCustomPathValid)}
                            isLoading={ledgerState.loading}
                            onClick={() => {
                                if (
                                    selectedMethod &&
                                    selectedMethod.method &&
                                    (selectedMethod.method === HardwareMethod.Cosmos ||
                                        selectedMethod.method === HardwareMethod.Lum)
                                ) {
                                    signInWithLedger({
                                        app: selectedMethod.method,
                                        customHdPath: showAdvanced ? customHdPath : undefined,
                                    }).catch(() => null);
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
                return <ImportPrivateKeyModal onSubmit={() => softwareMethodModal?.hide()} />;
            case SoftwareMethod.Guarda:
                return <ImportGuardaModal onSubmit={() => softwareMethodModal?.hide()} />;
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
            {!wallet ? (
                <AuthLayout>
                    <div className="container mb-4">
                        <div className="mb-4rem">
                            <h1 className="text-center display-5">{t('welcome.title')}</h1>
                        </div>
                        <div className="row justify-content-center gy-4">
                            <div className="col-12 col-lg-3">
                                <ImportButton
                                    method="extension"
                                    disabled={keplrState.loading}
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
                                    note={t('welcome.extensionModal.info')}
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
                                    disabled={keplrState.loading}
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
                                <Link role="button" to="/create" className="text-reset text-decoration-none">
                                    <div className="scale-anim btn-padding h-100 w-100 text-center d-flex align-items-center flex-column justify-content-evenly">
                                        <div className="create-btn rounded-circle mb-4 mb-lg-0 d-flex justify-content-center align-items-center">
                                            <img
                                                className="img-fluid"
                                                src={Assets.images.addIcon}
                                                width="27"
                                                height="27"
                                            />
                                        </div>
                                        <h3>{t('welcome.createWallet')}</h3>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </AuthLayout>
            ) : null}
            <Modal
                id="importSoftwareModal"
                ref={importSoftwareModalRef}
                withCloseButton={!keplrState.loading}
                onCloseButtonPress={() => setTimeout(() => setSelectedMethod(null), 150)}
                bodyClassName="px-3"
                contentClassName="px-2 import-modal-content"
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

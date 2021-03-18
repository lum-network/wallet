import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { RootState } from 'redux/store';

import { Card, Modal } from 'components';
import Assets from 'assets';

import './Auth.scss';

import AuthLayout from './components/AuthLayout';
import Button from 'components/Buttons/Button';

type MethodModalType = 'mnemonic' | 'privateKey' | 'keystore';

const Welcome = (): JSX.Element => {
    // State
    const [selectedMethod, setSelectedMethod] = useState<MethodModalType | null>(null);
    const [selectedMethodTemp, setSelectedMethodTemp] = useState<MethodModalType | null>(null);
    const [keystoreFile, setKeystoreFile] = useState<File | null>(null);

    // Redux hooks
    const wallet = useSelector((state: RootState) => state.wallet.currentWallet);

    if (wallet) {
        return <Redirect to="/home" />;
    }

    // Utils hooks
    const history = useHistory();
    const { t } = useTranslation();

    // Effects
    useEffect(() => {
        const importSoftwareDocumentModal = document.getElementById('importSoftwareModal');

        if (importSoftwareDocumentModal) {
            importSoftwareDocumentModal.addEventListener(
                'hidden.bs.modal',
                () => {
                    if (selectedMethod) {
                        if (keystoreFile) {
                            keystoreFile.text().then((fileData) => {
                                history.push(`/import/software/${selectedMethod}`, { fileData });
                            });
                        } else {
                            history.push(`/import/software/${selectedMethod}`);
                        }
                    }
                    setSelectedMethod(null);
                    setSelectedMethodTemp(null);
                },
                { once: true },
            );
        }
    }, [selectedMethod, selectedMethodTemp, keystoreFile]);

    // SOFTWARE IMPORT MODAL
    const importSoftwareModal = (
        <Modal id="importSoftwareModal" bodyClassName="px-4" contentClassName="px-3 import-modal-content">
            <p className="danger-text">{t('welcome.softwareModal.notRecommanded')}</p>
            <h3 className="mt-4">{t('welcome.softwareModal.title')}</h3>
            <p>{t('welcome.softwareModal.notRecommandedDescription')}</p>
            <div className="d-flex flex-column my-4">
                <button
                    type="button"
                    onClick={() => setSelectedMethodTemp('keystore')}
                    className={`import-software-btn ${selectedMethodTemp === 'keystore' && 'selected'}`}
                >
                    <div className="d-flex align-items-center justify-content-center">
                        <img src={Assets.images.softwareIcon} height="28" className="me-3" />
                        {t('welcome.softwareModal.types.keystore')}
                    </div>
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedMethodTemp('mnemonic')}
                    className={`import-software-btn my-4 ${selectedMethodTemp === 'mnemonic' && 'selected'}`}
                >
                    <div className="d-flex align-items-center justify-content-center">
                        <img src={Assets.images.bubbleIcon} height="28" className="me-3" />
                        {t('welcome.softwareModal.types.mnemonic')}
                    </div>
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedMethodTemp('privateKey')}
                    className={`import-software-btn ${selectedMethodTemp === 'privateKey' && 'selected'}`}
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
                disabled={!selectedMethodTemp}
                onClick={() => {
                    if (selectedMethodTemp === 'keystore') {
                        const keystoreInputElement = document.getElementById('keystore-input');

                        if (keystoreInputElement) {
                            keystoreInputElement.click();
                        }
                    } else {
                        setSelectedMethod(selectedMethodTemp);
                    }
                }}
                {...(selectedMethodTemp !== 'keystore' && {
                    'data-bs-dismiss': 'modal',
                    'data-bs-target': '#importSoftwareModal',
                })}
                className="my-4 w-100"
            >
                {t('common.continue')}
            </Button>
            {selectedMethodTemp === 'keystore' && (
                <input
                    id="keystore-input"
                    type="file"
                    hidden
                    accept=".json"
                    onChange={(event) => {
                        if (event.target.files && event.target.files.length > 0) {
                            const importSoftwareDocumentModal = document.getElementById('importSoftwareModal');

                            if (importSoftwareDocumentModal) {
                                importSoftwareDocumentModal.click();
                            }
                            setSelectedMethod(selectedMethodTemp), setKeystoreFile(event.target.files[0]);
                        }
                    }}
                />
            )}
        </Modal>
    );

    return (
        <>
            <AuthLayout>
                <div className="container mb-4">
                    <div className="mb-4rem">
                        <h1 className="text-center display-5">{t('welcome.title')}</h1>
                    </div>
                    <div className="row justify-content-center gy-4">
                        <div className="col-12 col-lg-3">
                            <a href="/import/hardware" className="text-reset text-decoration-none">
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
                                </Card>
                            </a>
                        </div>
                        <div className="col-12 col-lg-3">
                            <a
                                role="button"
                                className="h-100 w-100 text-reset text-decoration-none"
                                data-bs-toggle="modal"
                                data-bs-target="#importSoftwareModal"
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
                                    <p className="danger-text">{t('welcome.softwareModal.notRecommanded')}</p>
                                </Card>
                            </a>
                        </div>
                        <div className="col-12 col-lg-3">
                            <a href="/create" className="text-reset text-decoration-none">
                                <div className="scale-anim btn-padding h-100 w-100 text-center d-flex align-items-center flex-column justify-content-evenly">
                                    <div className="create-btn rounded-circle mb-4 mb-lg-0 d-flex justify-content-center align-items-center">
                                        <img className="img-fluid" src={Assets.images.addIcon} width="27" height="27" />
                                    </div>
                                    <h3>{t('welcome.createWallet')}</h3>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </AuthLayout>
            {importSoftwareModal}
        </>
    );
};

export default Welcome;

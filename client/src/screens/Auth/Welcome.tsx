import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { RootState } from 'redux/store';

import { Card, Modal } from 'components';
import Assets from 'assets';

import './Auth.scss';

import AuthLayout from './AuthLayout';
import Button from 'components/Buttons/Button';

type MethodModalType = 'mnemonic' | 'privateKey' | 'keystore';

const Welcome = (): JSX.Element => {
    const address = useSelector((state: RootState) => state.wallet.address);
    const history = useHistory();

    if (address) {
        return <Redirect to="/home" />;
    }

    const { t } = useTranslation();

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
                        history.push(`/import/software/${selectedMethod}`);
                    }
                    setSelectedMethod(null);
                    setSelectedMethodTemp(null);
                },
                { once: true },
            );
        }
    }, [selectedMethod, selectedMethodTemp]);

    // SOFTWARE IMPORT MODALS
    const importSoftwareModal = (
        <Modal id="importSoftwareModal" bodyClassName="px-4" contentClassName="px-3">
            <p className="not-recommanded">{t('welcome.softwareModal.notRecommanded')}</p>
            <h3 className="mt-4">{t('welcome.softwareModal.title')}</h3>
            <p>{t('welcome.softwareModal.notRecommandedDescription')}</p>
            <div className="d-flex flex-column my-4">
                <button
                    type="button"
                    onClick={() => setSelectedMethodTemp('keystore')}
                    className={`import-software-btn ${selectedMethodTemp === 'keystore' && 'selected'}`}
                >
                    {t('welcome.softwareModal.types.keystore')}
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedMethodTemp('mnemonic')}
                    className={`import-software-btn my-4 ${selectedMethodTemp === 'mnemonic' && 'selected'}`}
                >
                    {t('welcome.softwareModal.types.mnemonic')}
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedMethodTemp('privateKey')}
                    className={`import-software-btn ${selectedMethodTemp === 'privateKey' && 'selected'}`}
                >
                    {t('welcome.softwareModal.types.privateKey')}
                </button>
            </div>
            <p>{t('welcome.softwareModal.description')}</p>
            <Button
                type="button"
                disabled={!selectedMethodTemp}
                onClick={() => setSelectedMethod(selectedMethodTemp)}
                data-bs-dismiss="modal"
                data-bs-target="#importSoftwareModal"
                className="my-4"
            >
                {t('common.continue')}
            </Button>
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
                            <a href="/import/hardware">
                                <Card className="scale-anim text-center btn-padding h-100 w-100">
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
                                className="h-100 w-100"
                                data-bs-toggle="modal"
                                data-bs-target="#importSoftwareModal"
                            >
                                <Card className="scale-anim text-center btn-padding h-100 w-100">
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
                            </a>
                        </div>
                        <div className="col-12 col-lg-3">
                            <a href="/create">
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

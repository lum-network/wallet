import React from 'react';
import { useTranslation } from 'react-i18next';
import { LumUtils } from '@lum-network/sdk-javascript';

import { Card, Button } from 'components';
import assets from 'assets';
import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch } from 'redux/store';

const KeystoreFileSave = (props: { data: LumUtils.KeyStore; password: string }): JSX.Element => {
    const { t } = useTranslation();

    const { signInWithKeystorefile } = useRematchDispatch((dispatch: RootDispatch) => ({
        signInWithKeystorefile: dispatch.wallet.signInWithKeystoreAsync,
    }));

    const downloadKeystoreFile = () => {
        const { data, password } = props;

        const element = document.createElement('a');
        const jsonText = JSON.stringify(data);
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonText));
        element.setAttribute('download', 'lum-keystore.json');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);

        signInWithKeystorefile({ data, password });
    };

    return (
        <Card className="import-card d-flex justify-content-center">
            <div className="w-75 d-flex flex-column align-items-center">
                <img className="my-5" src={assets.images.softwareIcon} />
                <h3>{t('welcome.keystoreFileSave.title')}</h3>
                <div className="container my-4">
                    <div className="row gy-4">
                        <div className="col-12">
                            <div className="keystore-step-container d-flex flex-row">
                                <img src={assets.images.shieldIcon} width="50" />
                                <div className="me-5">
                                    <h4 className="keystore-step-title mb-1">
                                        {t('welcome.keystoreFileSave.lose.title')}
                                    </h4>
                                    <p className="auth-paragraph p-0">
                                        {t('welcome.keystoreFileSave.lose.description')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="keystore-step-container d-flex flex-row">
                                <img src={assets.images.anonymousIcon} width="50" />
                                <div>
                                    <h4 className="keystore-step-title mb-1">
                                        {t('welcome.keystoreFileSave.share.title')}
                                    </h4>
                                    <p className="auth-paragraph p-0">
                                        {t('welcome.keystoreFileSave.share.description')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="keystore-step-container d-flex flex-row">
                                <img src={assets.images.cloudIcon} width="50" />
                                <div>
                                    <h4 className="keystore-step-title mb-1">
                                        {t('welcome.keystoreFileSave.backup.title')}
                                    </h4>
                                    <p className="auth-paragraph p-0">
                                        {t('welcome.keystoreFileSave.backup.description')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Button type="button" onClick={downloadKeystoreFile}>
                    {t('welcome.keystoreFileSave.download')}
                </Button>
            </div>
        </Card>
    );
};

export default KeystoreFileSave;

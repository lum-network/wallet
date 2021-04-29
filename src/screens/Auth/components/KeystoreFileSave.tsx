import React from 'react';
import { LumUtils } from '@lum-network/sdk-javascript';

import Assets from 'assets';
import { Card, Button } from 'components';
import assets from 'assets';
import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch } from 'redux/store';

const KeystoreFileSave = (props: { data: LumUtils.KeyStore; password: string }): JSX.Element => {
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
                <img className="my-5" src={Assets.images.softwareIcon} />
                <h3>Save My Keystore File</h3>
                <div className="container my-4">
                    <div className="row gy-4">
                        <div className="col-12">
                            <div className="keystore-step-container d-flex flex-row">
                                <img src={assets.images.shieldIcon} width="50" />
                                <div className="me-5">
                                    <h4 className="keystore-step-title mb-1">{"Don't Lose It"}</h4>
                                    <p className="p-0">
                                        Be careful, it can not be recovered
                                        <br />
                                        if you lose it.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="keystore-step-container d-flex flex-row">
                                <img src={assets.images.anonymousIcon} width="50" />
                                <div>
                                    <h4 className="keystore-step-title mb-1">{"Don't Share It"}</h4>
                                    <p className="p-0">
                                        Your funds will be stolen if you use this file on a malicious phishing site.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="keystore-step-container d-flex flex-row">
                                <img src={assets.images.cloudIcon} width="50" />
                                <div>
                                    <h4 className="keystore-step-title mb-1">{'Make a Backup'}</h4>
                                    <p className="p-0">
                                        Secure it like the millions of dollars
                                        <br />
                                        it may one day be worth.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Button type="button" onClick={downloadKeystoreFile}>
                    Download
                </Button>
            </div>
        </Card>
    );
};

export default KeystoreFileSave;

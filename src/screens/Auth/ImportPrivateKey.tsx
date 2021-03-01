import React, { useState } from 'react';
import { Card, Input } from 'components';

import AuthLayout from './components/AuthLayout';
import { useTranslation } from 'react-i18next';
import Button from 'components/Buttons/Button';

const ImportPrivateKey = (): JSX.Element => {
    const { t } = useTranslation();

    const [privateKey, setPrivateKey] = useState('');

    return (
        <AuthLayout>
            <div className="d-flex flex-column align-items-center mb-4">
                <div className="mb-4rem">
                    <h1 className="text-center display-5">Import by Private Key</h1>
                </div>
                <Card className="import-card d-flex flex-column text-center align-items-center">
                    <div className="import-card py-4">
                        <div className="mb-4rem">
                            <p className="danger-text">{t('welcome.softwareModal.notRecommanded')}</p>
                            <p>{t('welcome.softwareModal.notRecommandedDescription')}</p>
                        </div>
                        <div className="mb-4rem">
                            <h3>Your Private key</h3>
                            <Input
                                value={privateKey}
                                onChange={(event) => setPrivateKey(event.target.value)}
                                description="Please enter at least 9 characters"
                                required
                                className="text-start my-4"
                            />
                        </div>
                        <Button disabled={!privateKey} className="mt-4">
                            Continue
                        </Button>
                    </div>
                </Card>
            </div>
        </AuthLayout>
    );
};

export default ImportPrivateKey;

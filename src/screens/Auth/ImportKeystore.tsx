import React, { useEffect } from 'react';
import { Redirect, useHistory, useLocation } from 'react-router';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import joi from 'joi';
import { Button, Card } from 'frontend-elements';

import AuthLayout from './components/AuthLayout';
import { Input } from 'components';
import { useTranslation } from 'react-i18next';
import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch, RootState } from 'redux/store';
import { useSelector } from 'react-redux';

const validationSchema = joi.object({
    privateKey: joi.string().required().min(9).messages({
        'string.min': 'Please enter at least 9 characters',
        'string.empty': 'Please enter at least 9 characters',
    }),
});

interface ImportKeystoreLocationState {
    fileData: string;
}

const ImportKeystore = (): JSX.Element => {
    const location = useLocation<ImportKeystoreLocationState>();

    if (!location.state) {
        return <Redirect to="/welcome" />;
    }

    const { fileData } = location.state;

    // Form hook
    const {
        register: privateKeyFormRegister,
        handleSubmit: privateKeyFormSubmit,
        setValue: setPrivateKeyPassword,
        formState: privateKeyPasswordFormState,
    } = useForm<{ privateKey: string }>({ defaultValues: { privateKey: '' }, resolver: joiResolver(validationSchema) });

    const wallet = useSelector((state: RootState) => state.wallet.currentWallet);
    const { t } = useTranslation();
    const history = useHistory();
    useEffect(() => {
        if (wallet) {
            history.push('/home');
        }
    }, [wallet]);

    const { signInWithKeystoreFile } = useRematchDispatch((dispatch: RootDispatch) => ({
        signInWithKeystoreFile: dispatch.wallet.signInWithKeystoreAsync,
    }));

    const onSubmitPassword = (data: { privateKey: string }) => {
        signInWithKeystoreFile({ data: fileData, password: data.privateKey });
    };

    return (
        <AuthLayout>
            <div className="mb-4rem">
                <h1 className="text-center display-5">Import by Keystore</h1>
            </div>
            <Card className="d-flex flex-column align-self-center text-center align-items-center access-card">
                <div className="import-card py-4 px-md-4">
                    <div className="mb-4rem">
                        <p className="danger-text">{t('welcome.softwareModal.notRecommanded')}</p>
                        <p>{t('welcome.softwareModal.notRecommandedDescription')}</p>
                    </div>
                    <div className="mb-4rem text-start">
                        <h3 className="text-center">Your Password</h3>
                        <Input
                            ref={privateKeyFormRegister}
                            type="password"
                            name="privateKey"
                            onChange={(event) => {
                                const newValue = event.target.value;
                                setPrivateKeyPassword('privateKey', newValue, { shouldValidate: true });
                            }}
                            placeholder="•••••••••"
                            className="mt-4"
                        />
                        {privateKeyPasswordFormState.errors.privateKey?.message && (
                            <p>{privateKeyPasswordFormState.errors.privateKey.message}</p>
                        )}
                    </div>
                    <Button onPress={privateKeyFormSubmit(onSubmitPassword)} className="mt-4 py-4 rounded-pill">
                        Continue
                    </Button>
                    <div className="mt-4rem">
                        <span className="fw-bold danger-text">DO NOT FORGET</span> to save your password. <br />
                        You will need this <span className="fw-bold danger-text">Password + Keystore</span> file to
                        access your wallet.
                    </div>
                </div>
            </Card>
        </AuthLayout>
    );
};

export default ImportKeystore;

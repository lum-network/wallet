import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { joiResolver } from '@hookform/resolvers/joi';
import joi from 'joi';

import { Button } from 'frontend-elements';
import { Card, Input } from 'components';
import AuthLayout from './components/AuthLayout';
import { useRematchDispatch } from 'redux/hooks';
import { RootState, RootDispatch } from 'redux/store';

const validationSchema = joi.object({
    privateKey: joi.string().required().min(64).messages({
        'string.min': 'Please enter at least 64 characters',
        'string.empty': 'Please enter at least 64 characters',
    }),
});

const ImportPrivateKey = (): JSX.Element => {
    // Form hook
    const { register, handleSubmit, setValue, formState: privateKeyPasswordFormState } = useForm<{
        privateKey: string;
    }>({ defaultValues: { privateKey: '' }, resolver: joiResolver(validationSchema) });

    const wallet = useSelector((state: RootState) => state.wallet.currentWallet);
    const { t } = useTranslation();
    const history = useHistory();
    useEffect(() => {
        if (wallet) {
            history.push('/home');
        }
    }, [wallet]);

    const { signInWithPrivateKey } = useRematchDispatch((dispatch: RootDispatch) => ({
        signInWithPrivateKey: dispatch.wallet.signInWithPrivateKeyAsync,
    }));

    const onSubmitPassword = (data: { privateKey: string }) => {
        signInWithPrivateKey(data.privateKey);
    };

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
                        <div className="text-start mb-4rem">
                            <h3 className="text-center">Your Private key</h3>
                            <Input
                                type="password"
                                placeholder="••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"
                                ref={register}
                                onChange={(event) => {
                                    const newValue = event.target.value;
                                    setValue('privateKey', newValue, { shouldValidate: true });
                                }}
                                name="privateKey"
                                required
                                className="text-start my-4"
                            />
                            {privateKeyPasswordFormState.errors.privateKey?.message && (
                                <p>{privateKeyPasswordFormState.errors.privateKey.message}</p>
                            )}
                        </div>
                        <Button onPress={handleSubmit(onSubmitPassword)} className="mt-4">
                            Continue
                        </Button>
                    </div>
                </Card>
            </div>
        </AuthLayout>
    );
};

export default ImportPrivateKey;

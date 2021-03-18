import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { Button } from 'frontend-elements';
import { Card, Input } from 'components';
import AuthLayout from './components/AuthLayout';
import { useRematchDispatch } from 'redux/hooks';
import { RootState, RootDispatch } from 'redux/store';

const ImportPrivateKey = (): JSX.Element => {
    // Redux hooks
    const wallet = useSelector((state: RootState) => state.wallet.currentWallet);
    const { signInWithPrivateKey } = useRematchDispatch((dispatch: RootDispatch) => ({
        signInWithPrivateKey: dispatch.wallet.signInWithPrivateKeyAsync,
    }));

    // Utils hooks
    const { t } = useTranslation();
    const history = useHistory();

    // Effects
    useEffect(() => {
        if (wallet) {
            history.push('/home');
        }
    }, [wallet]);

    // Form hook
    const formik = useFormik({
        initialValues: {
            privateKey: '',
        },
        validationSchema: yup.object().shape({
            privateKey: yup.string().min(64, 'Please enter at least 64 characters').required(t('common.required')),
        }),
        onSubmit: (values) => onSubmitPassword(values.privateKey),
    });

    // Methods
    const onSubmitPassword = (privateKey: string) => {
        signInWithPrivateKey(privateKey);
    };

    return (
        <AuthLayout>
            <div className="mb-4rem">
                <h1 className="text-center display-5">Import by Private Key</h1>
            </div>
            <Card className="d-flex flex-column align-self-center text-center align-items-center access-card">
                <div className="import-card py-4">
                    <div className="mb-4rem">
                        <p className="danger-text">{t('welcome.softwareModal.notRecommanded')}</p>
                        <p>{t('welcome.softwareModal.notRecommandedDescription')}</p>
                    </div>
                    <div className="text-start mb-4rem">
                        <h3 className="text-center">Your Private key</h3>
                        <Input
                            {...formik.getFieldProps('privateKey')}
                            type="password"
                            placeholder="••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"
                            required
                            className="text-start my-4"
                        />
                        {formik.touched.privateKey && formik.errors.privateKey && <p>{formik.errors.privateKey}</p>}
                    </div>
                    <Button onPress={formik.handleSubmit} className="mt-4">
                        Continue
                    </Button>
                </div>
            </Card>
        </AuthLayout>
    );
};

export default ImportPrivateKey;

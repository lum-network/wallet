import React, { useEffect } from 'react';
import { Redirect, useHistory, useLocation } from 'react-router';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Button, Card } from 'frontend-elements';

import AuthLayout from './components/AuthLayout';
import { Input } from 'components';
import { useTranslation } from 'react-i18next';
import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch, RootState } from 'redux/store';
import { useSelector } from 'react-redux';

interface ImportKeystoreLocationState {
    fileData: string;
}

const ImportKeystore = (): JSX.Element => {
    // Redux hooks
    const { signInWithKeystoreFile } = useRematchDispatch((dispatch: RootDispatch) => ({
        signInWithKeystoreFile: dispatch.wallet.signInWithKeystoreAsync,
    }));
    const wallet = useSelector((state: RootState) => state.wallet.currentWallet);

    // Utils hooks
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation<ImportKeystoreLocationState>();

    // If keystore file data is missing, redirect the user to welcom page
    if (!location.state || !location.state.fileData) {
        return <Redirect to="/welcome" />;
    }

    const { fileData } = location.state;

    // Form hook
    const formik = useFormik({
        initialValues: {
            password: '',
        },
        validationSchema: yup.object().shape({
            password: yup.string().min(9, 'Please enter at least 9 characters').required(t('common.required')),
        }),
        onSubmit: (values) => onSubmitPassword(values.password),
    });

    // Effects
    useEffect(() => {
        if (wallet) {
            history.push('/home');
        }
    }, [wallet]);

    // Methods
    const onSubmitPassword = (password: string) => {
        signInWithKeystoreFile({ data: fileData, password });
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
                            {...formik.getFieldProps('password')}
                            type="password"
                            placeholder="•••••••••"
                            className="mt-4"
                        />
                        {formik.touched.password && formik.errors.password && <p>{formik.errors.password}</p>}
                    </div>
                    <Button onPress={formik.handleSubmit} className="mt-4 py-4 rounded-pill">
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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { Button, Input } from 'components';
import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch, RootState } from 'redux/store';
import { useSelector } from 'react-redux';

const ImportKeystoreModal = (props: { fileData: string; onSubmit: () => void }): JSX.Element => {
    // Redux hooks
    const { signInWithKeystoreFile } = useRematchDispatch((dispatch: RootDispatch) => ({
        signInWithKeystoreFile: dispatch.wallet.signInWithKeystoreAsync,
    }));

    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.signInWithKeystoreAsync.loading);

    // Utils hooks
    const { t } = useTranslation();

    const { fileData, onSubmit } = props;

    // Form hook
    const formik = useFormik({
        initialValues: {
            password: '',
        },
        validationSchema: yup.object().shape({
            password: yup
                .string()
                .min(9, t('common.lengthError', { count: 9 }))
                .required(t('common.required')),
        }),
        onSubmit: (values) => onSubmitPassword(values.password),
    });

    // Methods
    const onSubmitPassword = (password: string) => {
        onSubmit();
        signInWithKeystoreFile({ data: fileData, password });
    };

    return (
        <>
            <div className="mb-4rem">
                <p className="not-recommended mb-2">{t('welcome.softwareModal.notRecommended')}</p>
                <h3 className="text-center">{t('welcome.softwareModal.importKeystore')}</h3>
                <p className="auth-paragraph">{t('welcome.softwareModal.notRecommendedDescription')}</p>
            </div>
            <form onSubmit={formik.handleSubmit}>
                <div className="mb-4rem text-start">
                    {/* Hidden input for accessibility */}
                    <input
                        readOnly
                        id="username"
                        autoComplete="username"
                        type="email"
                        value=""
                        style={{ display: 'none' }}
                    />
                    <Input
                        {...formik.getFieldProps('password')}
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your keystore password"
                        className="mt-4"
                    />
                    {formik.touched.password && formik.errors.password && (
                        <p className="color-error">{formik.errors.password}</p>
                    )}
                </div>
                <Button type="submit" isLoading={isLoading} className="mt-4 w-100">
                    {t('common.continue')}
                </Button>
            </form>
            <p className="auth-paragraph mt-5 mb-3">
                <span className="fw-bold danger-text">{t('createWallet.doNotForget')}</span>
                {t('createWallet.keystore.warningDescription1')}
                <span className="fw-bold danger-text">{t('createWallet.keystore.pwdPlusKeystore')}</span>
                {t('createWallet.keystore.warningDescription2')}
            </p>
        </>
    );
};

export default ImportKeystoreModal;

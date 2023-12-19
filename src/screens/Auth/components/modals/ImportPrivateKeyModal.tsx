import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { Button, Input } from 'components';
import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch, RootState } from 'redux/store';
import { useSelector } from 'react-redux';

const ImportPrivateKeyModal = ({ onSubmit }: { onSubmit: () => void }): JSX.Element => {
    // Redux hooks
    const { signInWithPrivateKey } = useRematchDispatch((dispatch: RootDispatch) => ({
        signInWithPrivateKey: dispatch.wallet.signInWithPrivateKeyAsync,
    }));

    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.signInWithPrivateKeyAsync.loading);

    // Utils hooks
    const { t } = useTranslation();

    // Form hook
    const formik = useFormik({
        initialValues: {
            privateKey: '',
        },
        validationSchema: yup.object().shape({
            privateKey: yup
                .string()
                .min(64, t('common.lengthError', { count: 64 }))
                .required(t('common.required')),
        }),
        onSubmit: (values) => onSubmitPassword(values.privateKey),
    });

    // Methods
    const onSubmitPassword = (privateKey: string) => {
        signInWithPrivateKey(privateKey).then(() => {
            onSubmit();
        });
    };

    return (
        <>
            <div className="mb-4rem">
                <p className="not-recommended mb-2">{t('welcome.softwareModal.notRecommended')}</p>
                <h3 className="text-center">{t('welcome.softwareModal.importPrivateKey')}</h3>
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
                        {...formik.getFieldProps('privateKey')}
                        type="password"
                        placeholder={t('welcome.softwareModal.privateKey.placeholder')}
                        autoComplete="current-password"
                        required
                        className="text-start mt-4"
                    />
                </div>
                {formik.touched.privateKey && formik.errors.privateKey && (
                    <p className="color-error">{formik.errors.privateKey}</p>
                )}
                <Button type="submit" isLoading={isLoading} className="mt-4 w-100">
                    {t('common.continue')}
                </Button>
            </form>
        </>
    );
};

export default ImportPrivateKeyModal;

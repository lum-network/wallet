import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { Input } from 'components';
import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch, RootState } from 'redux/store';
import { useSelector } from 'react-redux';
import { Button } from 'frontend-elements';

import '../styles/Auth.scss';

const ImportKeystoreModal = (props: { fileData: string; onSubmit: () => void }): JSX.Element => {
    // Redux hooks
    const { signInWithKeystoreFile } = useRematchDispatch((dispatch: RootDispatch) => ({
        signInWithKeystoreFile: dispatch.wallet.signInWithKeystoreAsync,
    }));

    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.signInWithKeystoreAsync);

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
    const onSubmitPassword = async (password: string) => {
        onSubmit();
        await signInWithKeystoreFile({ data: fileData, password });
    };

    return (
        <>
            <div className="mb-4rem">
                <p className="not-recommanded mb-2">{t('welcome.softwareModal.notRecommanded')}</p>
                <h3 className="text-center">{t('welcome.softwareModal.importKeystore')}</h3>
                <p className="auth-paragraph">{t('welcome.softwareModal.notRecommandedDescription')}</p>
            </div>
            <div className="mb-4rem text-start">
                <Input
                    {...formik.getFieldProps('password')}
                    type="password"
                    placeholder="Enter your keystore password"
                    className="mt-4"
                />
                {formik.touched.password && formik.errors.password && <p>{formik.errors.password}</p>}
            </div>
            <Button onPress={formik.handleSubmit} loading={isLoading} className="mt-4 py-4 rounded-pill">
                {t('common.continue')}
            </Button>
            <p className="auth-paragraph mt-5 mb-3">
                <span className="fw-bold danger-text">DO NOT FORGET</span> to save your password. <br />
                You will need this <span className="fw-bold danger-text">Password + Keystore</span> file to access your
                wallet.
            </p>
        </>
    );
};

export default ImportKeystoreModal;

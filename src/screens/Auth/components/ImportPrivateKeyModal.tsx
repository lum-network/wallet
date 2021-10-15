import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { Button } from 'frontend-elements';
import { Input } from 'components';
import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch } from 'redux/store';

const ImportPrivateKeyModal = (): JSX.Element => {
    // Redux hooks
    const { signInWithPrivateKey } = useRematchDispatch((dispatch: RootDispatch) => ({
        signInWithPrivateKey: dispatch.wallet.signInWithPrivateKeyAsync,
    }));

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
        signInWithPrivateKey(privateKey);
    };

    return (
        <>
            <div className="mb-4rem">
                <p className="not-recommended mb-2">{t('welcome.softwareModal.notRecommended')}</p>
                <h3 className="text-center">{t('welcome.softwareModal.importPrivateKey')}</h3>
                <p className="auth-paragraph">{t('welcome.softwareModal.notRecommendedDescription')}</p>
            </div>
            <div className="text-start mb-4rem">
                <Input
                    {...formik.getFieldProps('privateKey')}
                    type="password"
                    placeholder={t('welcome.softwareModal.privateKey.placeholder')}
                    required
                    className="text-start mt-4"
                />
                {formik.touched.privateKey && formik.errors.privateKey && <p>{formik.errors.privateKey}</p>}
            </div>
            <Button onPress={formik.handleSubmit} className="mt-4 w-100">
                {t('common.continue')}
            </Button>
        </>
    );
};

export default ImportPrivateKeyModal;

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
            privateKey: yup.string().min(64, 'Please enter at least 64 characters').required(t('common.required')),
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
                <p className="not-recommanded mb-2">{t('welcome.softwareModal.notRecommanded')}</p>
                <h3 className="text-center">Access by Private key</h3>
                <p>{t('welcome.softwareModal.notRecommandedDescription')}</p>
            </div>
            <div className="text-start mb-4rem">
                <Input
                    {...formik.getFieldProps('privateKey')}
                    type="password"
                    placeholder="Enter your private key"
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

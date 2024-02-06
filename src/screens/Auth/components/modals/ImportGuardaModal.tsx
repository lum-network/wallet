import React from 'react';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { FileInput, Input, Button } from 'components';
import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch, RootState } from 'redux/store';
import { showErrorToast } from 'utils';

const ImportGuardaModal = (props: { onSubmit: () => void }): JSX.Element => {
    // Redux hooks
    const { signInWithGuarda } = useRematchDispatch((dispatch: RootDispatch) => ({
        signInWithGuarda: dispatch.wallet.signInWithGuardaAsync,
    }));

    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.signInWithGuardaAsync.loading);

    // Utils hooks
    const { t } = useTranslation();

    const { onSubmit } = props;

    // Form hook
    const formik = useFormik({
        initialValues: {
            password: '',
            guardaBackup: '',
        },
        validationSchema: yup.object().shape({
            password: yup.string().required(t('common.required')),
            guardaBackup: yup.string().required(t('common.required')),
        }),
        onSubmit: (values) => onSubmitPassword(values.guardaBackup, values.password),
    });

    // Methods
    const onSubmitPassword = (guardaBackup: string, password: string) => {
        onSubmit();
        signInWithGuarda({ guardaBackup, password });
    };

    return (
        <>
            <div className="mb-4rem">
                <p className="not-recommended mb-2">{t('welcome.softwareModal.notRecommended')}</p>
                <h3 className="mt-4">{t('welcome.softwareModal.guardaBackup.title')}</h3>
                <p className="auth-paragraph">{t('welcome.softwareModal.notRecommendedDescription')}</p>
            </div>
            <form onSubmit={formik.handleSubmit}>
                {/* Hidden input for accessibility */}
                <input
                    readOnly
                    id="username"
                    autoComplete="username"
                    type="email"
                    value=""
                    style={{ display: 'none' }}
                />
                <FileInput
                    className="text-start my-4"
                    onChange={(event) => {
                        if (event.target.files && event.target.files.length > 0) {
                            event.target.files[0].text().then(async (data) => {
                                await formik.setFieldValue('guardaBackup', data);
                            });
                        } else {
                            showErrorToast(t('welcome.softwareModal.guardaBackup.errors.file'));
                        }
                    }}
                />
                <Input
                    {...formik.getFieldProps('password')}
                    type="password"
                    autoComplete="current-password"
                    label={t('welcome.softwareModal.guardaBackup.pwdInputLabel')}
                    className="text-start mt-4 mb-4rem"
                    placeholder={t('welcome.softwareModal.guardaBackup.placeholder')}
                />
                {formik.touched.password && formik.errors.password && <p>{formik.errors.password}</p>}
                <Button
                    isLoading={isLoading}
                    disabled={!formik.values.guardaBackup || !formik.values.password}
                    type="submit"
                    className="my-4 mx-auto"
                >
                    {t('common.continue')}
                </Button>
            </form>
        </>
    );
};

export default ImportGuardaModal;

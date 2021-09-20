import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { LumUtils } from '@lum-network/sdk-javascript';

import { Card, Button } from 'frontend-elements';
import Assets from 'assets';
import { Input, SwitchInput } from 'components';
import { PasswordStrength, PasswordStrengthType, SoftwareType } from 'models';
import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch, RootState } from 'redux/store';

import AuthLayout from './components/AuthLayout';
import WelcomeCarousel from './components/WelcomeCarousel';
import KeystoreFileSave from './components/KeystoreFileSave';
import { MnemonicLength, WalletUtils } from 'utils';
import printJS from 'print-js';

const CreateWallet = (): JSX.Element => {
    // State values
    const [introDone, setIntroDone] = useState(true);
    const [creationType, setCreationType] = useState<SoftwareType>(SoftwareType.Mnemonic);
    const [mnemonicLength, setMnemonicLength] = useState<MnemonicLength>(12);
    const [inputsValues, setInputsValues] = useState<string[]>([]);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(PasswordStrengthType.Weak);
    const [keystoreFileData, setKeystoreFileData] = useState<LumUtils.KeyStore | null>(null);
    const [keystoreFilePassword, setKeystoreFilePassword] = useState('');

    /* CODE RELATED TO EXTRA WORD FOR FUTURE IMPLEMENTATION

    const [isExtraWord, setIsExtraWord] = useState(false);
    const [extraWord, setExtraWord] = useState(''); */

    // Redux hooks
    const wallet = useSelector((state: RootState) => state.wallet.currentWallet);
    const { signInWithMnemonic } = useRematchDispatch((dispatch: RootDispatch) => ({
        signInWithMnemonic: dispatch.wallet.signInWithMnemonicAsync,
    }));

    // Utils hooks
    const history = useHistory();
    const { t } = useTranslation();

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
    const generateNewMnemonic = useCallback(() => {
        setInputsValues(WalletUtils.generateMnemonic(mnemonicLength));
    }, [mnemonicLength]);

    const onSubmitPassword = (password: string) => {
        setKeystoreFilePassword(password);
        setKeystoreFileData(WalletUtils.generateKeystoreFile(password));
    };

    const continueWithMnemonic = () => {
        const mnemonic = inputsValues.join(' ');

        signInWithMnemonic(mnemonic);
    };

    const printMnemonic = () => {
        printJS({
            printable: [{ mnemonic: inputsValues }],
            properties: [{ field: 'mnemonic', displayName: 'Lum Network - Wallet mnemonic' }],
            type: 'json',
        });
    };

    // Effects
    useEffect(() => {
        if (wallet) {
            history.push('/home');
        }
    }, [history, wallet]);

    useEffect(() => {
        if (creationType === SoftwareType.Mnemonic) {
            generateNewMnemonic();
        }
    }, [creationType, generateNewMnemonic]);

    useEffect(() => {
        generateNewMnemonic();
    }, [generateNewMnemonic, mnemonicLength]);

    // Render content
    const mnemonicContent = (
        <div className="w-100 py-4 px-md-4">
            <p className="not-recommanded">{t('welcome.softwareModal.notRecommanded')}</p>
            <p className="auth-paragraph">{t('welcome.softwareModal.notRecommandedDescription')}</p>
            <h3 className="mt-4rem">{t('createWallet.mnemonic.title')}</h3>
            <div className="d-flex flex-row align-self-stretch align-items-center justify-content-between mt-4rem">
                <div className="d-flex flex-row align-items-center">
                    <SwitchInput
                        id="mnemonicLength"
                        offLabel="12"
                        onLabel="24"
                        checked={mnemonicLength === 24}
                        onChange={(event) => setMnemonicLength(event.target.checked ? 24 : 12)}
                    />
                    <h6>{t('createWallet.mnemonic.values')}</h6>
                </div>
                <Button
                    className="d-flex flex-row align-items-center bg-transparent text-btn"
                    onPress={generateNewMnemonic}
                >
                    <img src={Assets.images.syncIcon} height="16" width="16" className="me-2" />
                    <h5>{t('createWallet.mnemonic.random')}</h5>
                </Button>
            </div>
            <div className="container-fluid py-4 mb-4">
                <div className="row gy-4" id="mnemonicInputsToPrint">
                    {inputsValues.map((input, index) => (
                        <div className="col-6 col-md-4" key={index}>
                            <Input
                                value={input}
                                disabled
                                inputStyle="custom"
                                name={`mnemonicInput${index}`}
                                id={`mnemonicInput${index}`}
                                type="form"
                                label={`${(index + 1).toString()}.`}
                                inputClass="mnemonic-input-create"
                                className="border-bottom form-inline align-middle mt-4"
                            />
                        </div>
                    ))}
                </div>
            </div>
            {/* <div className="separator mb-4 w-100"></div>
            <div className="d-flex flex-row justify-content-between align-self-stretch align-items-center my-4">
                <h5 className="p-0 m-0">Extra word</h5>
                <SwitchInput id="isExtraWord" onChange={(event) => setIsExtraWord(event.target.checked)} />
            </div>
            {isExtraWord && (
                <div className="mb-4rem">
                    <Input
                        value={extraWord}
                        name="extraWord"
                        onChange={(event) => setExtraWord(event.target.value)}
                        placeholder="Please enter at least 9 characters"
                        className="mb-3"
                    />
                    <p>
                        If you choose to include an extra word, understand you will ALWAYS need this extra word with
                        your mnemonic phrase. You can not change it. It becomes a permanent part of your phrase.
                    </p>
                </div>
            )} */}
            <div className="d-flex align-items-center justify-content-center">
                <Button className="justify-self-stretch me-4 py-4 rounded-pill" onPress={continueWithMnemonic}>
                    {t('createWallet.mnemonic.button')}
                </Button>
                <Button onPress={printMnemonic} className="scale-anim bg-transparent">
                    <img src={Assets.images.printIcon} height="34" width="34" />
                </Button>
            </div>
            <div className="mt-4rem">
                <span className="fw-bold danger-text">{t('createWallet.doNotForget')}</span>
                {t('createWallet.mnemonic.warningDescription')}
            </div>
        </div>
    );

    const keystoreContent = (
        <div className="w-100 py-4 px-md-4">
            <div className="mb-4rem">
                <p className="not-recommanded">{t('welcome.softwareModal.notRecommanded')}</p>
                <p className="auth-paragraph">{t('welcome.softwareModal.notRecommandedDescription')}</p>
            </div>
            <div className="mb-4rem text-start">
                <h3 className="text-center">{t('createWallet.keystore.title')}</h3>
                <Input
                    {...formik.getFieldProps('password')}
                    type="password"
                    onChange={(event) => {
                        const newValue = event.target.value;
                        formik.handleChange(event);
                        setPasswordStrength(WalletUtils.checkPwdStrength(newValue));
                    }}
                    placeholder="•••••••••"
                    className="mt-4"
                />
                <p className="auth-paragraph">
                    {t('createWallet.keystore.pwdStrength')}
                    <span
                        className={`text-capitalize fw-bold ${
                            passwordStrength === PasswordStrengthType.Strong
                                ? 'success'
                                : passwordStrength === PasswordStrengthType.Medium
                                ? 'warning'
                                : 'danger'
                        }-text`}
                    >
                        {passwordStrength}
                    </span>
                </p>
                {formik.touched.password && formik.errors.password && (
                    <p className="auth-paragraph">{formik.errors.password}</p>
                )}
            </div>
            <Button onPress={formik.handleSubmit} className="mt-4 py-4 rounded-pill">
                {t('createWallet.keystore.button')}
            </Button>
            <div className="mt-4rem">
                <span className="fw-bold danger-text">{t('createWallet.doNotForget')}</span>
                {t('createWallet.keystore.warningDescription1')}
                <span className="fw-bold danger-text">{t('createWallet.keystore.pwdPlusKeystore')}</span>
                {t('createWallet.keystore.warningDescription2')}
            </div>
        </div>
    );

    return (
        <AuthLayout>
            <div className="d-flex flex-column align-items-center mb-4">
                <div className="mb-4rem text-center">
                    <h1 className="display-5">{t('createWallet.title')}</h1>
                    <p className="auth-paragraph">
                        {t('createWallet.alreadyHave')}
                        <span className="ms-1">
                            <Link to="/welcome" className="text-btn-green">
                                {t('createWallet.accessWallet')}
                            </Link>
                        </span>
                    </p>
                </div>
                {introDone ? (
                    keystoreFileData ? (
                        <KeystoreFileSave data={keystoreFileData} password={keystoreFilePassword} />
                    ) : (
                        <Card className="container import-card" withoutPadding>
                            <ul className="row nav nav-tabs border-0 text-center">
                                <li
                                    className={`col-6 nav-item pt-4 pb-2 ${
                                        creationType === SoftwareType.Keystore ? 'active' : ''
                                    }`}
                                >
                                    <a
                                        className="nav-link fs-5 border-0"
                                        onClick={() => setCreationType(SoftwareType.Keystore)}
                                    >
                                        <img src={Assets.images.fileIcon} width="25" height="34" className="me-4" />
                                        <span>{t('createWallet.keystoreTab')}</span>
                                    </a>
                                </li>
                                <li
                                    className={`col-6 nav-item pt-4 pb-2 ${
                                        creationType === SoftwareType.Mnemonic ? 'active' : ''
                                    }`}
                                >
                                    <a
                                        className="nav-link fs-5 border-0"
                                        onClick={() => setCreationType(SoftwareType.Mnemonic)}
                                    >
                                        <img src={Assets.images.bubbleIcon} width="39" height="34" className="me-4" />
                                        <span>{t('createWallet.mnemonicTab')}</span>
                                    </a>
                                </li>
                            </ul>
                            <div className="d-flex flex-column align-self-center text-center align-items-center py-4">
                                {creationType === SoftwareType.Mnemonic && mnemonicContent}
                                {creationType === SoftwareType.Keystore && keystoreContent}
                            </div>
                        </Card>
                    )
                ) : (
                    <WelcomeCarousel onCarouselEnd={() => setIntroDone(true)} />
                )}
            </div>
        </AuthLayout>
    );
};

export default CreateWallet;

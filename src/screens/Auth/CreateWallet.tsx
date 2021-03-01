import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch, RootState } from 'redux/store';
import { joiResolver } from '@hookform/resolvers/joi';
import joi from 'joi';

import Assets from 'assets';
import { Button, Card, Input, SwitchInput } from 'components';
import { PasswordStrength, PasswordStrengthType } from 'models';
import { WalletUtils } from 'utils';
import { checkPwdStrength, generateKeystoreFile } from 'utils/wallet';
import AuthLayout from './components/AuthLayout';
import WelcomeCarousel from './components/WelcomeCarousel';
import { LumUtils } from '@lum-network/sdk-javascript';
import KeystoreFileSave from './components/KeystoreFileSave';

type CreationType = 'mnemonic' | 'keystore' | 'privateKey';

const validationSchema = joi.object({
    privateKey: joi.string().required().min(9).messages({
        'string.min': 'Please enter at least 9 characters',
        'string.empty': 'Please enter at least 9 characters',
    }),
});

const CreateWallet = (): JSX.Element => {
    // State values
    const [introDone, setIntroDone] = useState(true);
    const [creationType, setCreationType] = useState<CreationType>('mnemonic');
    const [mnemonicLength, setMnemonicLength] = useState<WalletUtils.MnemonicLength>(12);
    const [isExtraWord, setIsExtraWord] = useState(false);
    const [extraWord, setExtraWord] = useState('');
    const [inputsValues, setInputsValues] = useState<string[]>([]);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(PasswordStrengthType.Weak);
    const [keystoreFileData, setKeystoreFileData] = useState<LumUtils.KeyStore | null>(null);
    const [keystoreFilePassword, setKeystoreFilePassword] = useState('');

    // Redux hooks
    const address = useSelector((state: RootState) => state.wallet.address);
    const { signInWithMnemonic } = useRematchDispatch((dispatch: RootDispatch) => ({
        signInWithMnemonic: dispatch.wallet.signInWithMnemonicAsync,
    }));

    // Utils hooks
    const history = useHistory();
    const { t } = useTranslation();

    // Form hook
    const {
        register: privateKeyFormRegister,
        handleSubmit: privateKeyFormSubmit,
        setValue: setPrivateKeyPassword,
        formState: privateKeyPasswordFormState,
    } = useForm<{ privateKey: string }>({ defaultValues: { privateKey: '' }, resolver: joiResolver(validationSchema) });

    // Effects
    useEffect(() => {
        if (address) {
            history.push('/home');
        }
    }, [address]);

    useEffect(() => {
        if (creationType === 'mnemonic') {
            generateNewMnemonic();
        }
    }, [creationType]);

    useEffect(() => {
        generateNewMnemonic();
    }, [mnemonicLength]);

    // Methods
    const generateNewMnemonic = () => {
        setInputsValues(WalletUtils.generateMnemonic(mnemonicLength));
    };

    const onSubmitPassword = (data: { privateKey: string }) => {
        setKeystoreFilePassword(data.privateKey);
        setKeystoreFileData(generateKeystoreFile(data.privateKey));
    };

    const continueWithMnemonic = () => {
        const mnemonic = inputsValues.join(' ');

        signInWithMnemonic(mnemonic);
    };

    // Render content
    const mnemonicContent = (
        <div className="d-flex flex-column align-self-center text-center align-items-center import-card py-4 px-md-4">
            <p className="danger-text">{t('welcome.softwareModal.notRecommanded')}</p>
            <p>{t('welcome.softwareModal.notRecommandedDescription')}</p>
            <h3 className="mt-4rem">Your mnemonic phrase</h3>
            <div className="d-flex flex-row align-self-stretch align-items-center justify-content-between mt-4rem">
                <div className="d-flex flex-row align-items-center">
                    <SwitchInput
                        id="mnemonicLength"
                        offLabel="12"
                        onLabel="24"
                        checked={mnemonicLength === 24}
                        onChange={(event) => setMnemonicLength(event.target.checked ? 24 : 12)}
                    />
                    <h6>Values</h6>
                </div>
                <Button
                    buttonType="custom"
                    className="d-flex flex-row align-items-center"
                    type="button"
                    onClick={generateNewMnemonic}
                >
                    <img src={Assets.images.syncIcon} height="16" width="16" className="me-2" />
                    <h5>Random</h5>
                </Button>
            </div>
            <div className="container-fluid py-4">
                <div className="row gy-4">
                    {inputsValues.map((input, index) => (
                        <div className="col-4" key={index}>
                            <Input
                                value={input}
                                disabled
                                inputStyle="custom"
                                name={`mnemonicInput${index}`}
                                id={`mnemonicInput${index}`}
                                type="form"
                                label={`${(index + 1).toString()}.`}
                                inputClass="border-0 mnemonic-input"
                                className="border-bottom form-inline align-middle mt-4"
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div className="separator my-4 w-100"></div>
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
            )}
            <div className="d-flex align-items-center">
                <Button type="button" className="justify-self-stretch me-4" onClick={continueWithMnemonic}>
                    I wrote down my mnemonic phrase
                </Button>
                <Button buttonType="custom" className="scale-anim">
                    <img src={Assets.images.printIcon} height="34" width="34" />
                </Button>
            </div>
            <div className="mt-4rem">
                <span className="fw-bold danger-text">DO NOT FORGET</span> to save your mnemonic phrase. <br />
                You will need this to access your wallet.
            </div>
        </div>
    );

    const keystoreContent = (
        <div className="import-card py-4 px-md-4">
            <div className="mb-4rem">
                <p className="danger-text">{t('welcome.softwareModal.notRecommanded')}</p>
                <p>{t('welcome.softwareModal.notRecommandedDescription')}</p>
            </div>
            <div className="mb-4rem text-start">
                <h3 className="text-center">Your Password</h3>
                <Input
                    ref={privateKeyFormRegister}
                    name="privateKey"
                    onChange={(event) => {
                        const newValue = event.target.value;
                        setPrivateKeyPassword('privateKey', newValue, { shouldValidate: true });
                        setPasswordStrength(checkPwdStrength(newValue));
                    }}
                    placeholder="•••••••••"
                    className="mt-4"
                />
                <p>
                    Password strength:{' '}
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
                {privateKeyPasswordFormState.errors.privateKey?.message && (
                    <p>{privateKeyPasswordFormState.errors.privateKey.message}</p>
                )}
            </div>
            <Button type="submit" onClick={privateKeyFormSubmit(onSubmitPassword)} className="mt-4">
                Continue
            </Button>
            <div className="mt-4rem">
                <span className="fw-bold danger-text">DO NOT FORGET</span> to save your password. <br />
                You will need this <span className="fw-bold danger-text">Password + Keystore</span> file to access your
                wallet.
            </div>
        </div>
    );

    return (
        <AuthLayout>
            <div className="d-flex flex-column align-items-center mb-4">
                <div className="mb-4rem">
                    <h1 className="text-center display-5">Get a new Wallet</h1>
                </div>
                {introDone ? (
                    keystoreFileData ? (
                        <KeystoreFileSave data={keystoreFileData} password={keystoreFilePassword} />
                    ) : (
                        <Card className="container import-card" custom>
                            <ul className="row nav nav-tabs border-0 text-center">
                                <li
                                    className={`col-6 nav-item pt-4 pb-2 ${
                                        creationType === 'keystore' ? 'active' : ''
                                    }`}
                                >
                                    <a className="nav-link fs-5 border-0" onClick={() => setCreationType('keystore')}>
                                        <img src={Assets.images.fileIcon} width="25" height="34" className="me-4" />
                                        <span>Keystore File</span>
                                    </a>
                                </li>
                                <li
                                    className={`col-6 nav-item pt-4 pb-2 ${
                                        creationType === 'mnemonic' ? 'active' : ''
                                    }`}
                                >
                                    <a className="nav-link fs-5 border-0" onClick={() => setCreationType('mnemonic')}>
                                        <img src={Assets.images.bubbleIcon} width="39" height="34" className="me-4" />
                                        <span>Mnemonic phrase</span>
                                    </a>
                                </li>
                            </ul>
                            <div className="d-flex flex-column align-self-center text-center align-items-center py-4">
                                {creationType === 'mnemonic' && mnemonicContent}
                                {creationType === 'keystore' && keystoreContent}
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

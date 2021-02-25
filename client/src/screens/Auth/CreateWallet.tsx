import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Carousel } from 'react-responsive-carousel';
import { useRematchDispatch } from 'redux/hooks';
import { useTranslation } from 'react-i18next';

import 'react-responsive-carousel/lib/styles/carousel.min.css';

import Assets from 'assets';
import { Card, Input, SwitchInput, Button } from 'components';
import { RootDispatch, RootState } from 'redux/store';
import { WalletUtils } from 'utils';

import AuthLayout from './AuthLayout';

const LAST = 3;
type CreationType = 'mnemonic' | 'keystore' | 'privateKey';

const CreateWallet = (): JSX.Element => {
    // State values
    const [currentSlide, setCurrentSlide] = useState(0);
    const [creationType, setCreationType] = useState<CreationType>('mnemonic');
    const [privateKey, setPrivateKey] = useState('');
    const [mnemonicLength, setMnemonicLength] = useState<WalletUtils.MnemonicLength>(12);
    const [introDone, setIntroDone] = useState(true);
    const [isExtraWord, setIsExtraWord] = useState(false);
    const [extraWord, setExtraWord] = useState('');
    const [inputsValues, setInputsValues] = useState<string[]>([]);

    // Redux hooks
    const address = useSelector((state: RootState) => state.wallet.address);
    const { signIn } = useRematchDispatch((dispatch: RootDispatch) => ({
        signIn: dispatch.wallet.signInAsync,
    }));

    // Other hooks
    const history = useHistory();
    const { register: mnemonicFormRegister, handleSubmit: mnemonicFormSubmit } = useForm();
    const { register: privateKeyFormRegister, handleSubmit: privateKeyFormSubmit } = useForm();
    const { t } = useTranslation();

    // Effects
    useEffect(() => {
        if (address) {
            history.push('/home');
        }
    }, [address]);

    useEffect(() => {
        if (creationType === 'mnemonic') {
            setInputsValues(WalletUtils.generateMnemonic(mnemonicLength));
        }
    }, [creationType]);

    useEffect(() => {
        setInputsValues(WalletUtils.generateMnemonic(mnemonicLength));
    }, [mnemonicLength]);

    const generateNewMnemonic = () => {
        setInputsValues(WalletUtils.generateMnemonic(mnemonicLength));
    };

    const onSlideChange = (index: number) => {
        if (currentSlide !== index) {
            setCurrentSlide(index);
        }
    };

    const onSubmit = (data: { address: string }) => {
        signIn(data.address);
    };

    const isEmptyField = () => {
        return inputsValues.findIndex((input) => input.length === 0) !== -1;
    };

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
                                ref={mnemonicFormRegister}
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
            <Button
                type="submit"
                onClick={mnemonicFormSubmit(onSubmit)}
                data-bs-dismiss="modal"
                data-bs-target="mnemonicModal"
                disabled={isEmptyField()}
            >
                {t('common.continue')}
            </Button>
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
            <div className="mb-4rem">
                <h3>Your Private key</h3>
                <Input
                    value={privateKey}
                    ref={privateKeyFormRegister}
                    name="privateKey"
                    onChange={(event) => setPrivateKey(event.target.value)}
                    description="Please enter at least 9 characters"
                    required
                    className="text-start mt-4"
                />
                <p className="text-start">
                    Password strength: <span className="fw-bold danger-text">Very Weak</span>
                </p>
            </div>
            <Button disabled={!privateKey} type="submit" onClick={privateKeyFormSubmit(onSubmit)} className="mt-4">
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
                    <Card className="container import-card" custom>
                        <ul className="row nav nav-tabs border-0 text-center">
                            <li className={`col-6 nav-item pt-4 pb-2 ${creationType === 'keystore' ? 'active' : ''}`}>
                                <a className="nav-link fs-5 border-0" onClick={() => setCreationType('keystore')}>
                                    <img src={Assets.images.fileIcon} width="25" height="34" className="me-4" />
                                    <span>Keystore File</span>
                                </a>
                            </li>
                            <li className={`col-6 nav-item pt-4 pb-2 ${creationType === 'mnemonic' ? 'active' : ''}`}>
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
                ) : (
                    <div>
                        <Carousel
                            renderArrowPrev={() => null}
                            renderArrowNext={() => null}
                            selectedItem={currentSlide}
                            onChange={onSlideChange}
                        >
                            <div>Slide 1</div>
                            <div>Slide 2</div>
                            <div>Slide 3</div>
                            <div>Slide 4</div>
                        </Carousel>
                        <div>
                            {currentSlide > 0 && (
                                <button onClick={() => setCurrentSlide(currentSlide - 1)}>Back</button>
                            )}
                            <button
                                onClick={() => {
                                    if (currentSlide === LAST) {
                                        setIntroDone(true);
                                    }
                                    setCurrentSlide(currentSlide + 1);
                                }}
                            >
                                {currentSlide === LAST ? 'Start' : 'Next'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthLayout>
    );
};

export default CreateWallet;

import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Carousel } from 'react-responsive-carousel';
import { useRematchDispatch } from 'redux/hooks';
import { LumUtils } from '@lum-network/sdk-javascript';

import { Card, Input, SwitchInput } from 'components';
import { RootDispatch, RootState } from 'redux/store';
import AuthLayout from './AuthLayout';

import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Button from 'components/Buttons/Button';
import { useTranslation } from 'react-i18next';

const LAST = 3;
type MnemonicLength = 12 | 24;
type CreationType = 'mnemonic' | 'keystore' | 'privateKey';

const fillNewMnemonicKeys = (mnemonicLength: MnemonicLength) => {
    const inputs: string[] = [];
    const mnemonicKeys = LumUtils.generateMnemonic(mnemonicLength).split(' ');

    for (let i = 0; i < mnemonicLength; i++) {
        inputs.push(mnemonicKeys[i]);
    }

    return inputs;
};

const CreateWallet = (): JSX.Element => {
    // State values
    const [currentSlide, setCurrentSlide] = useState(0);
    const [creationType, setCreationType] = useState<CreationType>('mnemonic');
    const [privateKey, setPrivateKey] = useState('');
    const [mnemonicLength, setMnemonicLength] = useState<MnemonicLength>(12);
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
            setInputsValues(fillNewMnemonicKeys(mnemonicLength));
        }
    }, [creationType]);

    useEffect(() => {
        setInputsValues(fillNewMnemonicKeys(mnemonicLength));
    }, [mnemonicLength]);

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
        <div className="d-flex flex-column align-self-center text-center align-items-center import-card py-4">
            <p className="not-recommanded">{t('welcome.softwareModal.notRecommanded')}</p>
            <p>{t('welcome.softwareModal.notRecommandedDescription')}</p>
            <SwitchInput id="mnemonicLength" onChange={(event) => setMnemonicLength(event.target.checked ? 24 : 12)} />
            <div className="container-fluid mb-4 py-4">
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
            <div className="separator" />
            <div className="d-flex flex-row justify-content-between align-self-stretch align-items-center my-4">
                <h5 className="p-0 m-0">Extra word</h5>
                <SwitchInput id="isExtraWord" onChange={(event) => setIsExtraWord(event.target.checked)} />
            </div>
            {isExtraWord && (
                <div className="mb-3">
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
                className="mt-4"
            >
                {t('common.continue')}
            </Button>
        </div>
    );

    const keystoreContent = (
        <div className="import-card py-4">
            <div className="mb-4rem">
                <p className="not-recommanded">{t('welcome.softwareModal.notRecommanded')}</p>
                <p>{t('welcome.softwareModal.notRecommandedDescription')}</p>
            </div>
            <div className="mb-4rem">
                <h3>Your Private key</h3>
                <Input
                    value={privateKey}
                    ref={privateKeyFormRegister}
                    onChange={(event) => setPrivateKey(event.target.value)}
                    description="Please enter at least 9 characters"
                    required
                    className="text-start my-4"
                />
            </div>
            <Button disabled={!privateKey} type="submit" onClick={privateKeyFormSubmit(onSubmit)} className="mt-4">
                Continue
            </Button>
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
                        <ul className="row nav nav-tabs">
                            <li className="col-6 nav-item">
                                <a className="nav-link" href="#keystore" onClick={() => setCreationType('keystore')}>
                                    Keystore File
                                </a>
                            </li>
                            <li className="col-6 nav-item">
                                <a className="nav-link" href="#mnemonic" onClick={() => setCreationType('mnemonic')}>
                                    Mnemonic phrase
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

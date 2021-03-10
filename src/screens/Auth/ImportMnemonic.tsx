import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';

import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch, RootState } from 'redux/store';

import { Card, Input, SwitchInput, Button } from 'components';

import AuthLayout from './components/AuthLayout';
import './Auth.scss';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

type MnemonicLength = 12 | 24;

const ImportMnemonic = (): JSX.Element => {
    const [mnemonicLength, setMnemonicLength] = useState<MnemonicLength>(12);
    /* const [isExtraWord, setIsExtraWord] = useState(false);
    const [extraWord, setExtraWord] = useState(''); */
    const [inputsValues, setInputsValues] = useState<string[]>([]);

    const { register, handleSubmit } = useForm();
    const { t } = useTranslation();
    const history = useHistory();

    const address = useSelector((state: RootState) => state.wallet.address);
    const { signInWithMnemonic } = useRematchDispatch((dispatch: RootDispatch) => ({
        signInWithMnemonic: dispatch.wallet.signInWithMnemonicAsync,
    }));

    useEffect(() => {
        if (address) {
            history.push('/home');
        }
    }, [address]);

    useEffect(() => {
        const inputs: string[] = [];

        for (let i = 0; i < mnemonicLength; i++) {
            inputs.push(inputsValues[i] || '');
        }

        setInputsValues(inputs);
    }, [mnemonicLength]);

    const onInputChange = (value: string, index: number) => {
        const newValues = [...inputsValues];

        newValues[index] = value;

        setInputsValues(newValues);
    };

    const onSubmit = () => {
        const mnemonic = inputsValues.join(' ');

        /* if (extraWord) {
            mnemonic += ' ' + extraWord;
        } */

        signInWithMnemonic(mnemonic);
    };

    const isEmptyField = () => {
        return inputsValues.findIndex((input) => input.length === 0) !== -1;
    };

    return (
        <AuthLayout>
            <div className="d-flex flex-column align-items-center mb-4">
                <div className="mb-4rem">
                    <h1 className="text-center display-5">Import by Mnemonic</h1>
                </div>
                <Card className="d-flex flex-column align-self-center text-center align-items-center access-card">
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
                        </div>
                        <div className="container-fluid py-4">
                            <div className="row gy-4">
                                {inputsValues.map((input, index) => (
                                    <div className="col-4" key={index}>
                                        <Input
                                            ref={register}
                                            value={input}
                                            required
                                            onChange={(event) => onInputChange(event.target.value, index)}
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
                        {/* <div className="separator my-4 w-100"></div>
                        <div className="d-flex flex-row justify-content-between align-self-stretch align-items-center my-4">
                            <h5 className="p-0 m-0">Extra word</h5>
                            <SwitchInput id="isExtraWord" onChange={(event) => setIsExtraWord(event.target.checked)} />
                        </div>
                        {isExtraWord && (
                            <div className="mb-4rem">
                                <Input
                                    ref={register}
                                    value={extraWord}
                                    name="extraWord"
                                    required
                                    onChange={(event) => setExtraWord(event.target.value)}
                                    placeholder="Please enter at least 9 characters"
                                    className="mb-3"
                                />
                                <p>
                                    If you choose to include an extra word, understand you will ALWAYS need this extra
                                    word with your mnemonic phrase. You can not change it. It becomes a permanent part
                                    of your phrase.
                                </p>
                            </div>
                        )} */}
                        <Button
                            type="submit"
                            onClick={handleSubmit(onSubmit)}
                            data-bs-dismiss="modal"
                            data-bs-target="mnemonicModal"
                            disabled={isEmptyField()}
                            className="mt-4"
                        >
                            {t('common.continue')}
                        </Button>
                    </div>
                </Card>
            </div>
        </AuthLayout>
    );
};

export default ImportMnemonic;

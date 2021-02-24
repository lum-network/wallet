import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';

import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch } from 'redux/store';

import { Card, Input, SwitchInput } from 'components';

import AuthLayout from './AuthLayout';
import './Auth.scss';
import Button from 'components/Buttons/Button';

type MnemonicLength = 12 | 24;

const ImportMnemonic = (): JSX.Element => {
    const [mnemonicLength, setMnemonicLength] = useState<MnemonicLength>(12);
    const [isExtraWord, setIsExtraWord] = useState(false);
    const [extraWord, setExtraWord] = useState('');
    const [inputsValues, setInputsValues] = useState<string[]>([]);

    const { register, handleSubmit } = useForm();
    const { t } = useTranslation();

    const { signIn } = useRematchDispatch((dispatch: RootDispatch) => ({
        signIn: dispatch.wallet.signInAsync,
    }));

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
        signIn(inputsValues.reduce((acc, val) => val + acc));
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
                    <div className="import-card py-4">
                        <p className="not-recommanded">{t('welcome.softwareModal.notRecommanded')}</p>
                        <p>{t('welcome.softwareModal.notRecommandedDescription')}</p>
                        <SwitchInput
                            id="mnemonicLength"
                            onChange={(event) => setMnemonicLength(event.target.checked ? 24 : 12)}
                        />
                        <div className="container-fluid mb-4 py-4">
                            <div className="row gy-4">
                                {inputsValues.map((input, index) => (
                                    <div className="col-4" key={index}>
                                        <Input
                                            ref={register}
                                            value={input}
                                            inputStyle="custom"
                                            name={`mnemonicInput${index}`}
                                            id={`mnemonicInput${index}`}
                                            onChange={(event) => onInputChange(event.target.value, index)}
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
                                    If you choose to include an extra word, understand you will ALWAYS need this extra
                                    word with your mnemonic phrase. You can not change it. It becomes a permanent part
                                    of your phrase.
                                </p>
                            </div>
                        )}
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

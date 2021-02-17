import Input from 'components/Inputs/Input';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from './Modal';

import './Modals.scss';
import '../../screens/Auth/Welcome.scss';
import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch } from 'redux/store';

type MnemonicLength = 16 | 24;

// To show this modal make sure you have "mnemonicModal" as the id for data-bs-target or getElementById
const MnemonicModal = (): JSX.Element => {
    const [mnemonicLength, setMnemonicLength] = useState<MnemonicLength>(16);
    const [inputsValues, setInputsValues] = useState<string[]>([]);

    const { register, handleSubmit } = useForm();

    const { signIn } = useRematchDispatch((dispatch: RootDispatch) => ({
        signIn: dispatch.wallet.signInAsync,
    }));

    useEffect(() => {
        const inputs: string[] = [];

        for (let i = 0; i < mnemonicLength; i++) {
            inputs.push('');
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

    return (
        <Modal id="mnemonicModal">
            <h6>Import by Mnemonic</h6>
            <div className="container">
                <div className="row gy-3">
                    <div className="form-check form-switch p-0 col-12">
                        <label className="form-check-label" htmlFor="mnemonicLength">
                            16
                        </label>
                        <input
                            className="form-check-input float-none mx-2"
                            type="checkbox"
                            id="mnemonicLength"
                            onChange={(event) => setMnemonicLength(event.target.checked ? 24 : 16)}
                        />
                        <label className="form-check-label" htmlFor="mnemonicLength">
                            24
                        </label>
                    </div>
                    {inputsValues.map((input, index) => (
                        <Input
                            ref={register}
                            value={input}
                            name={`mnemonicInput${index}`}
                            onChange={(event) => onInputChange(event.target.value, index)}
                            key={index}
                            type="form"
                            label={`${(index + 1).toString()}.`}
                            inputClass="mnemonic-input border-top-0 border-start-0 border-end-0 ms-2"
                            className="col-6"
                        />
                    ))}
                </div>
            </div>
            <button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                data-bs-dismiss="modal"
                data-bs-target="mnemonicModal"
                //disabled={!selectedMethodTemp}
                className="continue-btn w-100 py-3 rounded-pill mt-4"
            >
                Continue
            </button>
        </Modal>
    );
};

export default MnemonicModal;

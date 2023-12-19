import React, { useState } from 'react';

import Input from './Input';

interface Props {
    className?: string;
    value: string;
    onChange: (value: string) => void;
    onCheck: (valid: boolean) => void;
}

const validateDerivationPath = (values: string[]) => {
    for (const val of values) {
        if (!val) {
            return false;
        }

        if (val === 'm') {
            continue;
        }

        const valToNumber = Number(val);
        if (Number.isNaN(valToNumber) || valToNumber < 0) {
            return false;
        }
    }

    return true;
};

const formatHDPath = (values: string[]) => {
    values[1] += "'";
    values[2] += "'";
    values[3] += "'";

    return values.join('/');
};

const HdPathInput = ({ className, value, onChange, onCheck }: Props): JSX.Element => {
    const [inputsValues, setInputsValues] = useState(value.split('/').map((val) => val.replace(`\'`, '')));
    const [error, setError] = useState(false);

    const onInputChange = (index: number, value: string) => {
        const values = [...inputsValues];

        values[index] = value;

        onChange(formatHDPath([...values]));
        setInputsValues(values);
        setTimeout(() => {
            const isValid = validateDerivationPath(values);
            setError(!isValid);
            onCheck(isValid);
        }, 100);
    };

    return (
        <>
            <div className={`d-flex flex-row align-items-center ${className}`}>
                <Input
                    disabled
                    alignment="center"
                    className="me-2"
                    inputStyle="custom"
                    inputClass="rounded-pill py-2"
                    value={inputsValues[0]}
                />
                /
                <Input
                    disabled
                    className="mx-2"
                    inputStyle="custom"
                    inputClass="rounded-pill py-2"
                    alignment="center"
                    value={inputsValues[1]}
                />
                /
                <Input
                    type="number"
                    min="0"
                    alignment="center"
                    className="mx-2"
                    inputStyle="custom"
                    inputClass="rounded-pill py-2"
                    value={inputsValues[2]}
                    onChange={(event) => onInputChange(2, event.target.value)}
                />
                /
                <Input
                    type="number"
                    min="0"
                    alignment="center"
                    className="mx-2"
                    inputStyle="custom"
                    inputClass="rounded-pill py-2"
                    value={inputsValues[3]}
                    onChange={(event) => onInputChange(3, event.target.value)}
                />
                /
                <Input
                    type="number"
                    min="0"
                    alignment="center"
                    className="mx-2"
                    inputStyle="custom"
                    inputClass="rounded-pill py-2"
                    value={inputsValues[4]}
                    onChange={(event) => onInputChange(4, event.target.value)}
                />
                /
                <Input
                    type="number"
                    min="0"
                    alignment="center"
                    className="mx-2"
                    inputStyle="custom"
                    inputClass="rounded-pill py-2"
                    value={inputsValues[5]}
                    onChange={(event) => onInputChange(5, event.target.value)}
                />
            </div>
            {error ? <p className="danger-text text-start mt-2">Invalid derivation path</p> : null}
        </>
    );
};

export default HdPathInput;

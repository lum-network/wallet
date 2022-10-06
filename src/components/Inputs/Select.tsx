import React, { useState } from 'react';

import './Inputs.scss';

interface Props extends React.ComponentPropsWithoutRef<'select'> {
    options: {
        name: string;
        value: string | number;
    }[];
    label?: string;
    readOnly?: boolean;
}

const Select = ({ options, label, readOnly, ...rest }: Props): JSX.Element => {
    const [selectedValue, setSelectedValue] = useState(options[0].name);

    return (
        <div className="d-flex flex-column select-container">
            {label ? <label className="form-label ms-2 fw-semibold">{label}</label> : null}
            {readOnly ? (
                <p className="ms-2 fw-normal">{selectedValue}</p>
            ) : (
                <select
                    {...rest}
                    onChange={(event) => {
                        if (rest.onChange) {
                            rest.onChange(event);
                        }

                        const selectedValue = options.find((opt) => {
                            if (typeof opt.value === 'number') {
                                return Number(event.target.value) === opt.value;
                            }
                            return event.target.value === opt.value;
                        })?.name;

                        if (selectedValue) {
                            setSelectedValue(selectedValue);
                        }
                    }}
                    className="form-select rounded-pill"
                >
                    {options.map((option) => (
                        <option key={`select-${option.name.toLowerCase()}`} value={option.value}>
                            {option.name}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};

export default Select;

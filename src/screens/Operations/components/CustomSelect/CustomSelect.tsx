import React, { useEffect, useState } from 'react';
import Select from 'react-select';

import './CustomSelect.scss';

interface Props {
    onChange: (value: string) => void;
    value: string;
    options: { value: string; label: string }[];
    label?: string;
    readonly?: boolean;
}

const CustomSelect = ({ options, onChange, value, readonly, label }: Props): JSX.Element => {
    const [selectedOptionLabel, setSelectedOptionLabel] = useState<string>(
        options.find((opt) => opt.value === value)?.label || '',
    );

    useEffect(() => {
        setSelectedOptionLabel(options.find((opt) => opt.value === value)?.label || '');
    }, [value]);

    return (
        <div className={`custom-select ${readonly && 'readonly'}`}>
            {label && (
                <label htmlFor="custom-select-input" className="form-label">
                    <p className="ms-2">{label}</p>
                </label>
            )}
            {readonly ? (
                <p>
                    {selectedOptionLabel || value}
                    <br />
                    {selectedOptionLabel && <small>({value})</small>}
                </p>
            ) : (
                <Select
                    id="custom-select-input"
                    defaultValue={{ value, label: selectedOptionLabel }}
                    value={{ value, label: selectedOptionLabel }}
                    styles={{
                        control: (provided) => ({
                            ...provided,
                            borderRadius: 999,
                            paddingLeft: '0.5rem',
                            paddingTop: '0.25rem',
                            paddingBottom: '0.25rem',
                        }),
                        option: (provided, state) => ({
                            ...provided,
                            color: state.isFocused || state.isSelected ? '#fff' : '#000',
                            backgroundColor: state.isFocused ? '#b5b5b5' : state.isSelected ? '#000' : '#fff',
                        }),
                    }}
                    options={options}
                    onChange={(val) => {
                        onChange(val?.value || '');
                    }}
                />
            )}
        </div>
    );
};

export default CustomSelect;

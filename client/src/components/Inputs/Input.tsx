import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    description?: string;
    inputClass?: string;
    value: string;
}

const Input = (props: InputProps): JSX.Element => {
    const { className, inputClass, label, description, ...rest } = props;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={rest.id} className="form-label">
                    {label}
                </label>
            )}
            <input className={inputClass} {...rest} />
            {description && <div className="form-text">{description}</div>}
        </div>
    );
};

export default Input;

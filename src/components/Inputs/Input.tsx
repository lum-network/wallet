import React from 'react';

import './Inputs.scss';

interface InputProps extends React.ComponentPropsWithRef<'input'> {
    label?: string;
    description?: string;
    inputClass?: string;
    inputStyle?: 'custom' | 'input';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const { className, inputClass, label, description, inputStyle = 'input', ...rest } = props;

    if (inputStyle === 'input') {
        return (
            <div className={`normal-input-container d-flex flex-column ${className}`}>
                {label && (
                    <label htmlFor={rest.id} className="form-label">
                        <p className="ms-2">{label}</p>
                    </label>
                )}
                <input ref={ref} className={`normal-input border-0 rounded-pill py-2 px-3 ${inputClass}`} {...rest} />
                {description && <div className="form-text">{description}</div>}
            </div>
        );
    }
    return (
        <div className={`input-group ${className}`}>
            {label && (
                <label htmlFor={rest.id} className="my-auto">
                    {label}
                </label>
            )}
            <input ref={ref} className={`form-control normal-input border-0 ${inputClass}`} {...rest} />
            {description && <div className="form-text">{description}</div>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;

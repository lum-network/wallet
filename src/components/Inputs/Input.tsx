import React from 'react';

import './Inputs.scss';

interface InputProps extends React.ComponentPropsWithRef<'input'> {
    icon?: JSX.Element;
    label?: string;
    description?: string;
    inputClass?: string;
    inputStyle?: 'custom' | 'input';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const { className, inputClass, label, icon, description, inputStyle = 'input', ...rest } = props;

    if (inputStyle === 'input') {
        return (
            <div className={`d-flex flex-column ${className}`}>
                {label && (
                    <label htmlFor={rest.id} className="form-label">
                        <p className="ms-2">{label}</p>
                    </label>
                )}
                <div
                    className={`normal-input ${
                        !rest.readOnly ? 'rounded-pill py-2 px-3' : 'read-only ps-2'
                    } ${inputClass}`}
                >
                    {icon}
                    <input ref={ref} className={`w-100 border-0`} {...rest} />
                </div>
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

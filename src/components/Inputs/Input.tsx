import React from 'react';

import './Inputs.scss';

interface InputProps extends React.ComponentPropsWithRef<'input'> {
    icon?: string;
    iconClass?: string;
    label?: string;
    description?: string;
    inputClass?: string;
    inputStyle?: 'custom' | 'input' | 'default';
    alignment?: 'left' | 'center';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const {
        className,
        inputClass,
        label,
        icon,
        iconClass,
        description,
        alignment = 'left',
        inputStyle = 'input',
        ...rest
    } = props;

    switch (inputStyle) {
        case 'custom':
            return (
                <div className={`d-flex flex-column ${className}`}>
                    {label && (
                        <label htmlFor={rest.id} className="form-label">
                            <p className="ms-2">{label}</p>
                        </label>
                    )}
                    <div className={`normal-input ${!rest.readOnly ? '' : 'read-only ps-2'} ${inputClass}`}>
                        {icon && <img src={icon} className={iconClass} />}
                        <input ref={ref} className={`w-100 p-0 border-0 text-${alignment}`} {...rest} />
                    </div>
                    {description && <div className="form-text">{description}</div>}
                </div>
            );
        case 'input':
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
                        {icon && <img src={icon} className={iconClass} />}
                        <input ref={ref} className={`w-100 border-0 text-${alignment}`} {...rest} />
                    </div>
                    {description && <div className="form-text">{description}</div>}
                </div>
            );
        default:
            return (
                <div className={`input-group ${className}`}>
                    {label && (
                        <label htmlFor={rest.id} className="my-auto">
                            {label}
                        </label>
                    )}
                    <input
                        ref={ref}
                        className={`form-control normal-input border-0 text-${alignment} ${inputClass}`}
                        {...rest}
                    />
                    {description && <div className="form-text">{description}</div>}
                </div>
            );
    }
});

Input.displayName = 'Input';

export default Input;

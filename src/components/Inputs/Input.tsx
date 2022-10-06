import { Button } from 'components';
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
    onMax?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const {
        className,
        inputClass,
        label,
        icon,
        iconClass,
        description,
        onMax,
        alignment = 'left',
        inputStyle = 'input',
        ...rest
    } = props;

    switch (inputStyle) {
        case 'custom':
            return (
                <div className={`d-flex flex-column ${className}`}>
                    {label && (
                        <label htmlFor={rest.id} className="form-label ms-2 fw-semibold">
                            {label}
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
                        <label htmlFor={rest.id} className="form-label ms-2 fw-semibold">
                            {label}
                        </label>
                    )}
                    <div
                        className={`normal-input d-flex flex-row justify-content-between ${
                            !rest.readOnly ? 'rounded-pill py-2 px-3' : 'read-only ps-2'
                        } ${inputClass}`}
                    >
                        {icon && <img src={icon} className={iconClass} />}
                        <input ref={ref} className={`w-100 border-0 text-${alignment}`} {...rest} />
                        {!!onMax && (
                            <span>
                                <Button type="button" buttonType="custom" onClick={onMax}>
                                    Max
                                </Button>
                            </span>
                        )}
                    </div>
                    {description && <div className="form-text">{description}</div>}
                </div>
            );
        default:
            return (
                <div className={`input-group ${className}`}>
                    {label && (
                        <label htmlFor={rest.id} className="my-auto fw-semibold">
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

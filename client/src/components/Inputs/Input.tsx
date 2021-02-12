import React from 'react';

interface InputProps extends React.ComponentPropsWithRef<'input'> {
    label?: string;
    description?: string;
    inputClass?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const { className, inputClass, label, description, ...rest } = props;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={rest.id} className="form-label">
                    {label}
                </label>
            )}
            <input ref={ref} className={inputClass} {...rest} />
            {description && <div className="form-text">{description}</div>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;

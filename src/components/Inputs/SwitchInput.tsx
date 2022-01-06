import React from 'react';

import './Inputs.scss';

interface SwitchProps extends Omit<React.ComponentPropsWithRef<'input'>, 'className'> {
    switchSize?: 'normal' | 'large';
    onLabel?: string;
    offLabel?: string;
    containerClassName?: string;
    inputClassName?: string;
}

const SwitchInput = (props: SwitchProps): JSX.Element => {
    const { offLabel, onLabel, containerClassName, inputClassName, switchSize = 'normal', ...rest } = props;

    return (
        <div className={`form-check form-switch p-0 ${containerClassName}`}>
            <input
                {...rest}
                className={`form-check-input switch-${switchSize} float-none mx-2 ${inputClassName}`}
                type="checkbox"
                role="switch"
                data-on-label={onLabel}
                data-off-label={offLabel}
            />
        </div>
    );
};

export default SwitchInput;

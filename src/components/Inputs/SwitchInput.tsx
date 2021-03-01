import React from 'react';

import './Inputs.scss';

interface SwitchProps extends React.ComponentPropsWithRef<'input'> {
    onLabel?: string;
    offLabel?: string;
}

const SwitchInput = (props: SwitchProps): JSX.Element => {
    const { offLabel, onLabel, ...rest } = props;

    return (
        <div className="form-check form-switch p-0">
            <input
                {...rest}
                className="form-check-input float-none mx-2"
                type="checkbox"
                data-on-label={onLabel}
                data-off-label={offLabel}
            />
        </div>
    );
};

export default SwitchInput;

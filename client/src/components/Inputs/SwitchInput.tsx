import React from 'react';

import './Inputs.scss';

interface SwitchProps extends React.ComponentPropsWithRef<'input'> {}

const SwitchInput = (props: SwitchProps): JSX.Element => {
    return (
        <div className="form-check form-switch p-0">
            <input {...props} className="form-check-input float-none mx-2" type="checkbox" />
        </div>
    );
};

export default SwitchInput;

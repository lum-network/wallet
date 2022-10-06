import React from 'react';

import './CustomSwitch.scss';

interface Props extends React.ComponentPropsWithRef<'input'> {}

const CustomSwitch = (props: Props): JSX.Element => {
    return (
        <div className="switch-button">
            <input {...props} className="switch-button-checkbox" type="checkbox" role="switch"></input>
            <label className="switch-button-label fw-semibold" htmlFor="">
                <span className="switch-button-label-span">ACTIVE</span>
            </label>
        </div>
    );
};

export default CustomSwitch;

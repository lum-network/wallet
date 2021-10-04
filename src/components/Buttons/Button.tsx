import { Loading } from 'frontend-elements';
import React from 'react';

import './Buttons.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    buttonType?: 'custom' | 'normal';
    isLoading?: boolean;
}

const Button = (props: ButtonProps): JSX.Element => {
    const { children, className, isLoading, buttonType = 'normal', ...rest } = props;

    return (
        <button
            {...rest}
            className={`${
                buttonType === 'normal'
                    ? 'normal-btn scale-anim d-flex justify-content-center align-items-center px-5 py-2 rounded-pill'
                    : 'scale-anim'
            } ${className}`}
        >
            {isLoading ? <Loading /> : children}
        </button>
    );
};

export default Button;

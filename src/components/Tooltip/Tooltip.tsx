import React from 'react';
import './Tooltip.scss';

interface TooltipProps {
    children?: React.ReactNode;
    className?: string;
    content?: string;
    direction?: 'top' | 'left' | 'right' | 'bottom';
    delay?: number;
    show: boolean;
}

const Tooltip = (props: TooltipProps): JSX.Element => {
    return (
        <div className={`wrapper ${props.className}`}>
            {/* Wrapping */}
            {props.children}
            <div className={`tip ${props.direction || 'top'} ${props.show ? 'show' : 'hide'}`}>
                {/* Content */}
                {props.content}
            </div>
        </div>
    );
};

export default Tooltip;

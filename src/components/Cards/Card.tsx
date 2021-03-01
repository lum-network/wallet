import React from 'react';

import './Cards.scss';

interface CardProps {
    children?: React.ReactNode;
    className?: string;
    custom?: boolean;
}

const Card = (props: CardProps): JSX.Element => {
    const { className, children, custom = false } = props;
    if (custom) {
        return <div className={`shadow-sm h-100 default-card bg-white ${className}`}>{children}</div>;
    }
    return <div className={`shadow-sm h-100 p-4 default-card bg-white ${className}`}>{children}</div>;
};

export default Card;

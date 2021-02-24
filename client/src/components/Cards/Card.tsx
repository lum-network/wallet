import React from 'react';

import './Cards.scss';

interface CardProps {
    children?: React.ReactNode;
    className?: string;
}

const Card = (props: CardProps): JSX.Element => {
    return <div className={`shadow-sm h-100 p-4 default-card bg-white ${props.className}`}>{props.children}</div>;
};

export default Card;

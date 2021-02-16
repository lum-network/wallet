import React from 'react';

interface CardProps {
    children: JSX.Element | JSX.Element[];
    className?: string;
}

const Card = (props: CardProps): JSX.Element => {
    return <div className={`shadow-sm h-100 p-4 rounded bg-white ${props.className}`}>{props.children}</div>;
};

export default Card;

import React from 'react';
import './SmallerDecimal.scss';

interface IProps {
    nb: string;
    big?: boolean;
}

const SmallerDecimal = ({ nb, big }: IProps): JSX.Element => {
    const split = nb.split('.');

    if (split.length > 1) {
        return (
            <span className={big ? 'smaller-decimal-big' : 'smaller-decimal'}>
                {split[0]}
                <small>.{split[1]}</small>
            </span>
        );
    }

    return big ? <h1 className="display-6 fw-normal">{nb}</h1> : <span>{nb}</span>;
};

export default SmallerDecimal;

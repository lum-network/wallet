import React from 'react';

import { Button } from 'components';
import './Dropdown.scss';

interface Props {
    title: string;
    disabled?: boolean;
    isLoading?: boolean;
    className?: string;
    direction?: 'down' | 'up';
    items: {
        title: string;
        onPress: () => void;
    }[];
}

const DropdownButton = ({ items, title, className, disabled, isLoading, direction = 'down' }: Props): JSX.Element => {
    return (
        <div id="dropdown" className={`drop${direction} ${className}`}>
            <Button
                type="button"
                buttonType="custom"
                className={`${isLoading ? '' : 'dropdown-toggle'} rounded-pill`}
                data-bs-toggle="dropdown"
                data-bs-display="static"
                disabled={disabled}
                isLoading={isLoading}
                aria-expanded="false"
            >
                {title}
            </Button>
            <ul
                className="dropdown-menu dropdown-menu-end text-center border-0 mb-3 w-100"
                aria-labelledby="dropdownMenu"
            >
                {items.map((item, index) => (
                    <li key={index}>
                        <a type="button" className="dropdown-item" onClick={item.onPress}>
                            {item.title}
                        </a>
                        {index < items.length - 1 && <hr className="dropdown-divider" />}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DropdownButton;

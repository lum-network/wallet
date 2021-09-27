import { Button } from 'components';
import React from 'react';

import './Dropdown.scss';

interface Props {
    title: string;
    id: string;
    disabled?: boolean;
    isLoading?: boolean;
    className?: string;
    direction?: 'down' | 'up';
    items: {
        title: string;
        onPress: () => void;
    }[];
}

const DropdownButton = ({
    items,
    title,
    id,
    className,
    disabled,
    isLoading,
    direction = 'down',
}: Props): JSX.Element => {
    return (
        <div className={`drop${direction} ${className}`}>
            <Button
                type="button"
                buttonType="custom"
                className={`${isLoading ? '' : 'dropdown-toggle'} rounded-pill`}
                data-bs-toggle="dropdown"
                data-bs-display="static"
                disabled={disabled}
                isLoading={isLoading}
                data-bs-target={`#${id}`}
                aria-expanded="false"
            >
                {title}
            </Button>
            <ul id={id} className="dropdown-menu dropdown-menu-end text-center border-0 mb-3" aria-labelledby={id}>
                {items.map((item, index) => (
                    <>
                        <li key={index}>
                            <a type="button" className="dropdown-item" onClick={item.onPress}>
                                {item.title}
                            </a>
                        </li>
                        {index < items.length - 1 && (
                            <li>
                                <hr className="dropdown-divider" />
                            </li>
                        )}
                    </>
                ))}
            </ul>
        </div>
    );
};

export default DropdownButton;

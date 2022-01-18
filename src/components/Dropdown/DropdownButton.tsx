import React from 'react';

import { Button } from 'components';
import './Dropdown.scss';

interface Props {
    title: string;
    items: {
        title?: string;
        onPress?: () => void;
        component?: JSX.Element;
    }[];
    direction?: 'down' | 'up';
    disabled?: boolean;
    plainButton?: boolean;
    withSeparator?: boolean;
    isLoading?: boolean;
    selectedItem?: string;
    className?: string;
    listClassName?: string;
}

const DropdownButton = ({
    items,
    title,
    className,
    listClassName,
    disabled,
    isLoading,
    selectedItem,
    direction = 'down',
    plainButton = false,
    withSeparator = true,
}: Props): JSX.Element => {
    return (
        <div id="dropdown" className={`drop${direction} ${className}`}>
            <Button
                type="button"
                buttonType="custom"
                className={`${
                    isLoading ? '' : `dropdown-toggle ${plainButton && 'dropdown-toggle-plain'}`
                } rounded-pill`}
                data-bs-toggle="dropdown"
                data-bs-display="static"
                disabled={disabled}
                isLoading={isLoading}
                aria-expanded="false"
            >
                {title}
            </Button>
            <ul
                className={`dropdown-menu dropdown-menu-end text-center border-0 mb-3 ${listClassName}`}
                aria-labelledby="dropdownMenu"
            >
                {items.map((item, index) => (
                    <li key={index}>
                        {item.component || (
                            <a
                                type="button"
                                className={`dropdown-item ${
                                    !!(selectedItem && selectedItem === item.title) && 'selected'
                                } ${!withSeparator && 'py-2'}`}
                                onClick={item.onPress}
                            >
                                {item.title}
                            </a>
                        )}
                        {withSeparator && index < items.length - 1 && <hr className="dropdown-divider" />}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DropdownButton;

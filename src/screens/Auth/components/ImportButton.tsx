import React from 'react';

import { Button, Card } from 'components';

interface Props {
    onClick: () => void;
    icon: string;
    title: string;
    description: string;
    note: string;
    method: 'extension' | 'software' | 'hardware';
    className?: string;
    disabled?: boolean;
    iconWidth?: string;
    iconHeight?: string;
    iconClassName?: string;
}

const ImportButton = ({
    onClick,
    icon,
    description = '',
    note = '',
    title = '',
    className,
    iconClassName,
    iconHeight,
    iconWidth,
    disabled,
    method,
}: Props): JSX.Element => {
    return (
        <Button
            buttonType="custom"
            data-bs-toggle="modal"
            data-bs-target="#importSoftwareModal"
            disabled={disabled}
            onClick={onClick}
            className={`h-100 w-100 text-reset text-decoration-none ${className}`}
        >
            <Card className="auth-card scale-anim text-center btn-padding h-100 w-100">
                <img
                    src={icon}
                    className={`img-fluid mb-4 ${iconClassName}`}
                    alt={`${method.toUpperCase()} button`}
                    width={iconWidth || '90'}
                    height={iconHeight || '90'}
                />
                <h3 className="mt-4">{title}</h3>
                <p className="auth-paragraph">{description}</p>
                <br />
                <p
                    className={
                        method === 'extension'
                            ? 'recommended'
                            : method === 'software'
                            ? 'not-recommended'
                            : 'auth-paragraph'
                    }
                >
                    {note}
                </p>
            </Card>
        </Button>
    );
};

export default ImportButton;

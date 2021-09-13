import React from 'react';
import './MessageButton.scss';
import { Card } from 'frontend-elements';

interface IProps {
    name: string;
    description: string;
    icon: string;
    iconClassName?: string;
    'data-bs-target': string;
    'data-bs-toggle': string;
}

const MessageButton = (props: IProps): JSX.Element => {
    const { icon, iconClassName, name, description, ...rest } = props;

    return (
        <div className="message-button-container h-100" {...rest}>
            <Card className="d-flex align-items-center text-center flex-column h-100">
                <div className="message-circle">
                    <img alt="image" src={icon} className={iconClassName} />
                </div>
                <h4 className="button-title mt-3 color-type">{name}</h4>
                <p>{description}</p>
            </Card>
        </div>
    );
};

export default MessageButton;

import React from 'react';
import './MessageButton.scss';
import { Card } from 'frontend-elements';

interface IProps {
    name: string;
    icon: string;
    'data-bs-target': string;
    'data-bs-toggle': string;
}

const MessageButton = (props: IProps): JSX.Element => {
    const { icon, name, ...rest } = props;

    return (
        <div className="message-button-container" {...rest}>
            <Card className="d-flex align-items-center flex-column">
                <div className="message-circle">
                    <img alt="image" src={icon} />
                </div>
                <h4 className="button-title text-center mt-3 color-type">{name}</h4>
            </Card>
        </div>
    );
};

export default MessageButton;

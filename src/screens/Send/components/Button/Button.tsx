import React from 'react';
import './Button.scss';
import { Card } from 'frontend-elements';

interface IProps {
    name: string;
    icon: string;
}

const Button = (props: IProps): JSX.Element => {
    const { icon, name } = props;

    return (
        <div className="message-button-container">
            <Card className="d-flex align-items-center flex-column">
                <div className="message-circle">
                    <img alt="image" src={icon} />
                </div>
                <h4 className="button-title text-center mt-3 color-type">{name}</h4>
            </Card>
        </div>
    );
};

export default Button;

import React from 'react';
import assets from 'assets';
import Button from './Button';

import './Buttons.scss';

const ToastCloseButton = ({
    closeButton,
}: {
    closeButton: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}): JSX.Element => (
    <Button onClick={closeButton} buttonType="custom" className="toast-close-btn rounded-circle p-2">
        <img src={assets.images.addIcon} width="20" height="20" />
    </Button>
);

export default ToastCloseButton;

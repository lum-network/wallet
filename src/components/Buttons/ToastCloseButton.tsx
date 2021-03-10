import assets from 'assets';
import { Button } from 'frontend-elements';
import React from 'react';

import './Buttons.scss';

const ToastCloseButton = ({ closeButton }: { closeButton: () => void }): JSX.Element => (
    <Button onPress={closeButton} className="toast-close-btn rounded-circle p-2">
        <img src={assets.images.addIcon} width="20" height="20" />
    </Button>
);

export default ToastCloseButton;

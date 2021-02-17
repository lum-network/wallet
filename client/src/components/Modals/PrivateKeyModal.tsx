import React from 'react';
import Modal from './Modal';

// To show this modal make sure you have "privateKeyModal" as the id for data-bs-target or getElementById
const PrivateKeyModal = (): JSX.Element => {
    return (
        <Modal id="privateKeyModal">
            <div>Private Key</div>
        </Modal>
    );
};

export default PrivateKeyModal;

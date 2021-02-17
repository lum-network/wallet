import React from 'react';
import Modal from './Modal';

// To show this modal make sure you have "keystoreModal" as the id for data-bs-target or getElementById
const KeystoreModal = (): JSX.Element => {
    return (
        <Modal id="keystoreModal">
            <div>Keystore</div>
        </Modal>
    );
};

export default KeystoreModal;

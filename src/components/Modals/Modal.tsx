import React, { useState, useEffect } from 'react';

import './Modals.scss';

interface Props {
    id: string;
    children?: React.ReactNode;
    withCloseButton?: boolean;
    contentClassName?: string;
    bodyClassName?: string;
    dataBsBackdrop?: 'static' | 'true';
    dataBsKeyboard?: boolean;
    onCloseButtonPress?: () => void;
}

const Modal = React.forwardRef<HTMLDivElement, Props>(
    (
        {
            id,
            children,
            bodyClassName,
            contentClassName,
            onCloseButtonPress,
            withCloseButton = true,
            dataBsBackdrop = 'true',
            dataBsKeyboard = true,
        },
        ref,
    ) => {
        const [buttonEnabled, setButtonEnabled] = useState(false);

        useEffect(() => {
            setTimeout(() => setButtonEnabled(true), 300);
        }, []);

        return (
            <div
                tabIndex={-1}
                id={id}
                className="modal fade"
                aria-labelledby={`${id}Label`}
                aria-hidden="true"
                data-bs-backdrop={dataBsBackdrop}
                data-bs-keyboard={dataBsKeyboard}
                ref={ref}
            >
                <div className="modal-dialog modal-dialog-centered my-5">
                    <div className={`border-0 text-center modal-content ${contentClassName}`}>
                        {withCloseButton && (
                            <button
                                type="button"
                                disabled={!buttonEnabled}
                                onClick={onCloseButtonPress}
                                className="close-btn bg-white rounded-circle align-self-center"
                                data-bs-dismiss="modal"
                                data-bs-target={id}
                                aria-label="Close"
                            >
                                <div className="btn-close mx-auto" />
                            </button>
                        )}
                        <div className={`modal-body mx-auto ${bodyClassName}`}>{children}</div>
                    </div>
                </div>
            </div>
        );
    },
);

Modal.displayName = 'Modal';

export default Modal;

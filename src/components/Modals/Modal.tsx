import React from 'react';

import './Modals.scss';

interface Props {
    id: string;
    children?: React.ReactNode;
    withCloseButton?: boolean;
    contentClassName?: string;
    bodyClassName?: string;
    dataBsBackdrop?: 'static' | 'true';
    onCloseButtonPress?: () => void;
}

const Modal = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
    const {
        id,
        children,
        bodyClassName,
        contentClassName,
        onCloseButtonPress,
        withCloseButton = true,
        dataBsBackdrop = 'true',
    } = props;

    return (
        <div
            tabIndex={-1}
            id={id}
            className="modal fade"
            aria-labelledby={`${id}Label`}
            aria-hidden="true"
            data-bs-backdrop={dataBsBackdrop}
            ref={ref}
        >
            <div className="modal-dialog modal-dialog-centered my-5">
                <div className={`border-0 text-center modal-content ${contentClassName}`}>
                    {withCloseButton && (
                        <button
                            type="button"
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
});

Modal.displayName = 'Modal';

export default Modal;

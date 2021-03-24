import React from 'react';

import './Modals.scss';

interface Props {
    id: string;
    children?: React.ReactNode;
    withCloseButton?: boolean;
    contentClassName?: string;
    bodyClassName?: string;
    dataBsBackdrop?: 'static' | 'true';
}

const Modal = (props: Props): JSX.Element => {
    const { id, children, bodyClassName, contentClassName, withCloseButton = true, dataBsBackdrop = 'true' } = props;

    return (
        <div
            tabIndex={-1}
            id={id}
            className="modal fade"
            aria-labelledby={`${id}Label`}
            aria-hidden="true"
            data-bs-backdrop={dataBsBackdrop}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className={`border-0 text-center modal-content ${contentClassName}`}>
                    {withCloseButton && (
                        <button
                            type="button"
                            className="close-btn btn-close bg-white rounded-circle align-self-center"
                            data-bs-dismiss="modal"
                            data-bs-target={id}
                            aria-label="Close"
                        />
                    )}
                    <div className={`modal-body mx-auto ${bodyClassName}`}>{children}</div>
                </div>
            </div>
        </div>
    );
};

export default Modal;

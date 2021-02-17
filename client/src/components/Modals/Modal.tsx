import React from 'react';

import './Modals.scss';

interface Props {
    id: string;
    children?: React.ReactNode;
    withCloseButton?: boolean;
    contentClassName?: string;
    bodyClassName?: string;
}

const Modal = (props: Props): JSX.Element => {
    const { id, children, bodyClassName, contentClassName, withCloseButton = true } = props;

    return (
        <div tabIndex={-1} id={id} className="modal fade" aria-labelledby={`${id}Label`} aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className={`modal-content border-0 rounded-3 text-center ${contentClassName}`}>
                    {withCloseButton && (
                        <button
                            type="button"
                            className="btn-close close-btn"
                            data-bs-dismiss="modal"
                            data-bs-target={id}
                            aria-label="Close"
                        ></button>
                    )}
                    <div className={`modal-body mx-auto ${bodyClassName}`}>{children}</div>
                </div>
            </div>
        </div>
    );
};

export default Modal;

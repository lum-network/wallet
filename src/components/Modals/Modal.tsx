import React, { useState, useEffect, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal as BootstrapModal } from 'bootstrap';

import './Modals.scss';

interface Props {
    id: string;
    children?: React.ReactNode;
    withCloseButton?: boolean;
    contentClassName?: string;
    bodyClassName?: string;
    dataBsBackdrop?: 'static' | boolean;
    dataBsKeyboard?: boolean;
    onCloseButtonPress?: () => void;
}

export interface ModalHandlers {
    toggle: () => void;
    show: () => void;
    hide: () => void;
    addEventListener: (event: string, listener: () => void) => void;
    removeEventListener: (event: string, listener: () => void) => void;
}

const Modal: React.ForwardRefRenderFunction<ModalHandlers, Props> = (props, ref) => {
    const {
        id,
        children,
        bodyClassName,
        contentClassName,
        onCloseButtonPress,
        withCloseButton = true,
        dataBsBackdrop = true,
        dataBsKeyboard = true,
    } = props;

    const [buttonEnabled, setButtonEnabled] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const bootstrapModalRef = useRef<BootstrapModal>();

    useEffect(() => {
        if (modalRef.current) {
            bootstrapModalRef.current = BootstrapModal.getOrCreateInstance(modalRef.current, {
                keyboard: dataBsKeyboard,
                backdrop: dataBsBackdrop,
            });
        }
    }, [modalRef]);

    useImperativeHandle(
        ref,
        () => ({
            toggle: () => {
                if (bootstrapModalRef.current) {
                    bootstrapModalRef.current.toggle();
                }
            },
            show: () => {
                if (bootstrapModalRef.current) {
                    bootstrapModalRef.current.show();
                }
            },
            hide: () => {
                if (bootstrapModalRef.current) {
                    bootstrapModalRef.current.hide();
                }
            },
            addEventListener: (event: string, listener: () => void) => {
                const el = document.getElementById(id);

                if (el) {
                    el.addEventListener(event, listener);
                }
            },
            removeEventListener: (event: string, listener: () => void) => {
                const el = document.getElementById(id);

                if (el) {
                    el.removeEventListener(event, listener);
                }
            },
        }),
        [bootstrapModalRef],
    );

    const { t } = useTranslation();

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
            ref={modalRef}
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
                            aria-label={t('common.close')}
                        >
                            <div className="btn-close mx-auto" />
                        </button>
                    )}
                    <div className={`modal-body mx-auto ${bodyClassName}`}>{children}</div>
                </div>
            </div>
        </div>
    );
};

Modal.displayName = 'Modal';

export default React.forwardRef(Modal);

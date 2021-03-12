import React, { useEffect } from 'react';
import { Tooltip } from 'bootstrap';
import ClipboardJS from 'clipboard';
import printJS from 'print-js';

import assets from 'assets';
import { Card, CodeQr } from 'frontend-elements';
import Modal from '../Modals/Modal';
import { useTranslation } from 'react-i18next';

const AddressCard = ({ address }: { address: string }): JSX.Element => {
    useEffect(() => {
        const clipboard = new ClipboardJS('#copy-btn');
        clipboard.on('success', () => {
            const btnEl = document.getElementById('copy-btn');
            if (btnEl) {
                const tooltip = new Tooltip(btnEl, { placement: 'bottom', title: 'Copied!', trigger: 'manual' });
                tooltip.show();
                setTimeout(() => {
                    tooltip.hide();
                }, 1500);
            }
        });
        clipboard.on('error', (e) => {
            console.log(e);
        });

        return () => {
            clipboard.destroy();
        };
    }, []);

    const { t } = useTranslation();

    const printAddress = () => {
        printJS({
            printable: [{ address }],
            properties: ['address'],
            type: 'json',
        });
    };

    return (
        <>
            <Card withoutPadding className="dashboard-card account-card p-4 h-100">
                <h2 className="ps-2 pt-3 text-white">{t('common.address')}</h2>
                <h6 className="text-truncate fw-normal ps-2 my-3 text-white w-100">{address}</h6>
                <div className="pb-2 ps-2">
                    <button type="button" data-bs-toggle="modal" data-bs-target="#qrModal" className="me-2">
                        <img src={assets.images.qrIcon} />
                    </button>
                    {ClipboardJS.isSupported() && (
                        <button type="button" id="copy-btn" data-clipboard-text={address} className="me-2">
                            <img src={assets.images.copyIcon} />
                        </button>
                    )}
                    <button type="button" className="tint-white" onClick={printAddress}>
                        <img src={assets.images.printIcon} />
                    </button>
                </div>
            </Card>
            <Modal id="qrModal">
                <CodeQr content="https://surprise.io" size={256} />
            </Modal>
        </>
    );
};

export default AddressCard;

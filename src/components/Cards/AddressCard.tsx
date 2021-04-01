import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ClipboardJS from 'clipboard';
import printJS from 'print-js';

import assets from 'assets';
import { Tooltip } from 'components';
import { Card, CodeQr } from 'frontend-elements';

import Modal from '../Modals/Modal';

const AddressCard = ({ address }: { address: string }): JSX.Element => {
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        const clipboard = new ClipboardJS('#copy-btn');
        clipboard.on('success', (e) => {
            e.clearSelection();
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 1000);
        });
        clipboard.on('error', (e) => {
            console.log(e);
        });

        return () => {
            clipboard.destroy();
        };
    });

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
                        <Tooltip show={showTooltip} content="Copied!" className="me-2" direction="bottom">
                            <button type="button" id="copy-btn" data-clipboard-text={address}>
                                <img src={assets.images.copyIcon} />
                            </button>
                        </Tooltip>
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

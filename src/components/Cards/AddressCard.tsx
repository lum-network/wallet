import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ClipboardJS from 'clipboard';
import printJS from 'print-js';

import assets from 'assets';
import { HoverTooltip } from 'components';
import { LUM_MINTSCAN_URL } from 'constant';
import { Card, CodeQr } from 'frontend-elements';
import { showErrorToast, showSuccessToast } from 'utils';

import Modal from '../Modals/Modal';

const AddressCard = ({ address }: { address: string }): JSX.Element => {
    const { t } = useTranslation();

    useEffect(() => {
        const clipboard = new ClipboardJS('#copy-btn');
        clipboard.on('success', (e) => {
            e.clearSelection();
            showSuccessToast(t('common.copyAddress'));
        });
        clipboard.on('error', () => {
            showErrorToast('An error occured when copying your address, try again');
        });

        return () => {
            clipboard.destroy();
        };
    }, [t]);

    const printAddress = () => {
        printJS({
            printable: [{ address }],
            properties: [{ field: 'address', displayName: 'Lum Network - Wallet address' }],
            type: 'json',
        });
    };

    return (
        <>
            <Card withoutPadding className="dashboard-card account-card p-4 h-100">
                <h2 className="ps-2 pt-3 text-white">{t('common.address')}</h2>
                <a
                    className="wallet-address"
                    href={`${LUM_MINTSCAN_URL}/address/${address}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    <h6 className="text-break fw-normal ps-2 my-3 text-white w-100">{address}</h6>
                </a>
                <div className="pb-2 ps-2">
                    <button type="button" data-bs-toggle="modal" data-bs-target="#qrModal" className="me-2">
                        <HoverTooltip text={t('common.qr')}>
                            <img src={assets.images.qrIcon} />
                        </HoverTooltip>
                    </button>
                    {ClipboardJS.isSupported() && (
                        <button type="button" id="copy-btn" data-clipboard-text={address}>
                            <HoverTooltip text={t('common.copy')}>
                                <img src={assets.images.copyIcon} />
                            </HoverTooltip>
                        </button>
                    )}
                    <HoverTooltip text={t('common.print')}>
                        <button type="button" className="tint-white" onClick={printAddress}>
                            <img src={assets.images.printIcon} />
                        </button>
                    </HoverTooltip>
                </div>
            </Card>
            <Modal id="qrModal">
                <CodeQr content={address} size={256} />
            </Modal>
        </>
    );
};

export default AddressCard;

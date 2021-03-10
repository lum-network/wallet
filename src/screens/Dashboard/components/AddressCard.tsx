import React, { useEffect } from 'react';
import { Tooltip } from 'bootstrap';
import ClipboardJS from 'clipboard';

import assets from 'assets';
import { Card } from 'frontend-elements';

const AddressCard = ({ address }: { address: string }): JSX.Element => {
    const clipboard = new ClipboardJS('#copy-btn');
    clipboard.on('success', () => {
        const btnEl = document.getElementById('copy-btn');
        if (btnEl) {
            const tooltip = new Tooltip(btnEl, { placement: 'bottom', title: 'Copied!', trigger: 'manual' });
            tooltip.show();
            setTimeout(() => tooltip.hide(), 1500);
        }
    });
    clipboard.on('error', (e) => {
        console.log(e);
    });

    useEffect(() => {
        return () => {
            clipboard.destroy();
        };
    }, []);

    return (
        <Card withoutPadding className="dashboard-card account-card p-4 h-100">
            <h2 className="ps-2 pt-3">Address</h2>
            <h6 className="text-truncate fw-normal ps-2">{address}</h6>
            <div className="pb-2 ps-2">
                <button type="button" data-bs-toggle="modal" data-bs-target="#qrModal" className="me-2">
                    <img src={assets.images.qrIcon} />
                </button>
                {ClipboardJS.isSupported() && (
                    <button type="button" id="copy-btn" data-clipboard-text={address} className="me-2">
                        <img src={assets.images.copyIcon} />
                    </button>
                )}
                <button type="button" className="tint-white">
                    <img src={assets.images.printIcon} />
                </button>
            </div>
        </Card>
    );
};

export default AddressCard;

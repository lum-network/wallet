import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router';
import ClipboardJS from 'clipboard';
import { Modal as BSModal } from 'bootstrap';
import { LumUtils, LumTypes } from '@lum-network/sdk-javascript';

import { AddressCard, BalanceCard, Input, Modal, Tooltip } from 'components';
import { RootState } from 'redux/store';
import { Button, Card } from 'frontend-elements';
import { Button as CustomButton } from 'components';
import { showErrorToast, showSuccessToast, WalletUtils } from 'utils';

import './styles/Messages.scss';
import { useTranslation } from 'react-i18next';

interface VerifyMessageResult {
    result: boolean;
    address: string;
    message: string;
}

const isMessageToVerify = (msg: {
    msg?: string;
    address?: string;
    sig?: Uint8Array;
    publicKey?: Uint8Array;
    signer?: string;
    version?: string;
}): msg is LumTypes.SignMsg => {
    return !!(msg.address && msg.msg && msg.publicKey && msg.sig && msg.signer && msg.version);
};

const verifyPlaceholder = `{
    "address": "lum968b882bf30932bebc7b440cc50e489438c4cce",
    "msg": "Hello World!",
    "publicKey": "a968b882bf30932bebc7b440cc50e489438c4cce82zcidns82ns9sx92sqaa212id",
    "sig": "a0feb1d1d026e2431b437ef7a9a190dc3edacea5de6ef41490212867643c19754424ff7c4ca62ee41cbd6a15d437754887f65c7ff113e3ea2264a4d8911a727b1c",
    "version": "1",
    "signer": "lum-sdk/paper"
}`;

const Message = (): JSX.Element => {
    // State
    const [message, setMessage] = useState('');
    const [messageToVerify, setMessageToVerify] = useState('');
    const [showTooltip, setShowTooltip] = useState(false);
    const [signMessage, setSignMessage] = useState<LumTypes.SignMsg | null>(null);
    const [verifyMessage, setVerifyMessage] = useState<VerifyMessageResult | null>(null);

    // Redux hooks
    const { wallet, currentBalance } = useSelector((state: RootState) => ({
        wallet: state.wallet.currentWallet,
        currentBalance: state.wallet.currentBalance,
    }));

    // Utils
    const { t } = useTranslation();

    // Refs
    const confirmModalRef = useRef<HTMLDivElement>(null);
    const signatureModalRef = useRef<HTMLDivElement>(null);

    // Effects
    useEffect(() => {
        const clipboard = new ClipboardJS('#copy-verify-message');
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

    useEffect(() => {
        const signatureClipboard = new ClipboardJS('#signature');
        signatureClipboard.on('success', (e) => {
            e.clearSelection();
            showSuccessToast(t('messages.messageCopied'));
        });
        signatureClipboard.on('error', (e) => {
            console.log(e);
            signatureClipboard.destroy();
        });

        return () => {
            signatureClipboard.destroy();
        };
    });

    if (!wallet) {
        return <Redirect to="/welcome" />;
    }

    // Methods
    const handleSign = async () => {
        const json = await WalletUtils.generateSignedMessage(wallet, message);
        setSignMessage(json);
        showModal('signature', true);
    };

    const handleVerify = async () => {
        const msg = JSON.parse(messageToVerify, (key, value) => {
            if (key === 'sig' || key === 'publicKey') {
                value = LumUtils.keyFromHex(value);
            }
            return value;
        });

        if (isMessageToVerify(msg)) {
            WalletUtils.validateSignMessage(msg)
                .then((result) => {
                    setVerifyMessage({ result, message: msg.msg, address: msg.address });
                })
                .catch((error) => showErrorToast(error.message));
        } else {
            showErrorToast(t('messages.invalidMessage'));
        }
    };

    const onClearVerify = () => {
        setMessageToVerify(''), setVerifyMessage(null);
    };

    const onClearAll = () => {
        setMessage('');
        onClearVerify();
    };

    const showModal = (id: 'signature' | 'confirmation', toggle: boolean) => {
        if (id === 'confirmation' && confirmModalRef.current) {
            const modal = new BSModal(confirmModalRef.current);
            return toggle ? modal.show() : modal.hide();
        } else if (id === 'signature' && signatureModalRef.current) {
            const modal = new BSModal(signatureModalRef.current);
            return toggle ? modal.show() : modal.hide();
        }
    };

    return (
        <>
            <div className="mt-4">
                <div className="container">
                    <div className="row gy-4">
                        <div className="col-md-6 col-12">
                            <AddressCard address={wallet.getAddress()} />
                        </div>
                        <div className="col-md-6 col-12">
                            <BalanceCard balance={currentBalance} address={wallet.getAddress()} />
                        </div>
                        <div className="col-lg-6 col-12">
                            <Card className="d-flex flex-column h-100 justify-content-between">
                                <div>
                                    <h2>{t('messages.sign.title')}</h2>
                                    <div className="my-4">{t('messages.sign.description')}</div>
                                    {wallet.isExtensionImport && (
                                        <div className="mb-3 not-recommended">{t('messages.sign.disabled')}</div>
                                    )}
                                    <div>
                                        <h4 className="mb-3">{t('messages.sign.inputLabel')}</h4>
                                        <textarea
                                            disabled={wallet.isExtensionImport}
                                            className="w-100 p-2"
                                            value={message}
                                            rows={10}
                                            onChange={(event) => setMessage(event.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="d-flex flex-column">
                                    <CustomButton
                                        className="mx-auto mt-5 px-5"
                                        data-bs-target="#sign-confirmation-modal"
                                        data-bs-toggle="modal"
                                        disabled={!message}
                                    >
                                        {t('messages.sign.button')}
                                    </CustomButton>
                                    <CustomButton className="bg-transparent text-btn mt-2 mx-auto" onClick={onClearAll}>
                                        {t('messages.clearAll')}
                                    </CustomButton>
                                </div>
                            </Card>
                        </div>
                        <div className="col-lg-6 col-12">
                            <Card className="d-flex flex-column h-100 justify-content-between">
                                <div>
                                    <h2>{t('messages.verify.title')}</h2>
                                    <div className="mt-4">
                                        <div className="d-flex flex-row justify-content-between mb-2">
                                            <h4>{t('messages.verify.inputLabel')}</h4>
                                            <div className="d-flex flex-row align-items-center">
                                                <Button
                                                    onPress={onClearVerify}
                                                    className="bg-transparent text-btn p-0 me-4 h-auto"
                                                >
                                                    {t('messages.clear')}
                                                </Button>
                                                {ClipboardJS.isSupported() && (
                                                    <Tooltip show={showTooltip} content="Copied!" direction="top">
                                                        <CustomButton
                                                            type="button"
                                                            buttonType="custom"
                                                            data-clipboard-text={messageToVerify}
                                                            id="copy-verify-message"
                                                            className="bg-transparent text-btn p-0 h-auto"
                                                        >
                                                            {t('common.copy')}
                                                        </CustomButton>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </div>
                                        <textarea
                                            className="w-100 p-2"
                                            value={messageToVerify}
                                            placeholder={verifyPlaceholder}
                                            rows={10}
                                            spellCheck={false}
                                            onChange={(event) => {
                                                setMessageToVerify(event.target.value), setVerifyMessage(null);
                                            }}
                                        />
                                    </div>
                                </div>
                                {verifyMessage && (
                                    <div
                                        className={`p-4 mt-2 result-box text-truncate ${
                                            verifyMessage.result ? 'success' : 'failure'
                                        }`}
                                    >
                                        {t('messages.verify.resultText', {
                                            address: verifyMessage.address,
                                            did: verifyMessage.result ? 'did' : 'did not',
                                            message: verifyMessage.message,
                                        })}
                                    </div>
                                )}
                                <div className="d-flex flex-column">
                                    <CustomButton
                                        className="mx-auto mt-5 px-5"
                                        onClick={handleVerify}
                                        disabled={!messageToVerify}
                                    >
                                        {t('messages.verify.button')}
                                    </CustomButton>
                                    <CustomButton className="bg-transparent text-btn mt-2 mx-auto" onClick={onClearAll}>
                                        {t('messages.clearAll')}
                                    </CustomButton>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                id="sign-confirmation-modal"
                ref={confirmModalRef}
                bodyClassName="w-100 px-4 pb-4 text-start"
                contentClassName="px-2"
            >
                <h3 className="my-4 text-center fw-bolder">{t('messages.confirmationModal.title')}</h3>
                <Input
                    disabled
                    value={wallet.getAddress()}
                    label={t('messages.confirmationModal.addressLabel')}
                    className="mb-4"
                />
                <Input disabled value={message} label={t('messages.confirmationModal.messageLabel')} className="mb-4" />
                <Input
                    disabled
                    value={LumUtils.keyToHex(LumUtils.toAscii(message), true)}
                    label={t('messages.confirmationModal.messageInHexLabel')}
                    className="mb-4"
                />
                <CustomButton data-bs-dismiss="modal" onClick={handleSign} className="mt-5 w-100">
                    {t('messages.confirmationModal.button')}
                </CustomButton>
            </Modal>
            <Modal id="signature-modal" ref={signatureModalRef} bodyClassName="w-100 px-4 pb-4" contentClassName="px-2">
                <h3 className="my-4 text-center fw-bolder">{t('messages.signatureModal.title')}</h3>
                {signMessage && (
                    <>
                        <textarea
                            readOnly
                            className="w-100 p-2"
                            value={JSON.stringify(
                                {
                                    ...signMessage,
                                    sig: LumUtils.keyToHex(signMessage.sig),
                                    publicKey: LumUtils.keyToHex(signMessage.publicKey),
                                },
                                null,
                                2,
                            )}
                            rows={15}
                        />
                        {ClipboardJS.isSupported() && <p>{t('messages.signatureModal.copyPayload')}</p>}
                        <CustomButton
                            id="signature"
                            data-bs-target="#signature-modal"
                            data-bs-dismiss="modal"
                            onClick={() => setMessage('')}
                            {...(ClipboardJS.isSupported() && {
                                'data-clipboard-text': JSON.stringify(
                                    {
                                        ...signMessage,
                                        sig: LumUtils.keyToHex(signMessage.sig),
                                        publicKey: LumUtils.keyToHex(signMessage.publicKey),
                                    },
                                    null,
                                    2,
                                ),
                            })}
                            className="mt-5 w-100"
                        >
                            {ClipboardJS.isSupported() ? t('common.copy') : t('common.close')}
                        </CustomButton>
                    </>
                )}
            </Modal>
        </>
    );
};

export default Message;

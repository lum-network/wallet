import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch, RootState } from 'redux/store';

import { Card } from 'frontend-elements';
import { AddressCard, BalanceCard, Input } from 'components';
import { Redirect } from 'react-router';

const Send = (): JSX.Element => {
    const { wallet, currentBalance } = useSelector((state: RootState) => ({
        wallet: state.wallet.currentWallet,
        currentBalance: state.wallet.currentBalance,
    }));

    if (!wallet) {
        return <Redirect to="/welcome" />;
    }

    const [recipientAddress, setRecipientAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [fees, setFees] = useState('');

    const { sendTx } = useRematchDispatch((dispatch: RootDispatch) => ({
        sendTx: dispatch.wallet.sendTx,
    }));
    const { register, handleSubmit } = useForm();
    const { t } = useTranslation();

    const onSend = (data: { to: string; amount: string }) => {
        sendTx({
            to: data.to,
            from: wallet,
            amount: amount,
            ticker: 'LUM',
        });
    };

    return (
        <div className="mt-4">
            <div className="container">
                <div className="row gy-4">
                    <div className="col-6">
                        <AddressCard address={wallet.address} />
                    </div>
                    <div className="col-6">
                        <BalanceCard balance={currentBalance} />
                    </div>
                    <div className="col">
                        <Card className="px-3 py-2">
                            <form onSubmit={handleSubmit(onSend)} className="row">
                                <div className="col-6">
                                    <Input
                                        ref={register}
                                        name="from"
                                        disabled
                                        className="mb-4"
                                        value={wallet.address}
                                        inputClass="form-control"
                                        label="Sender"
                                        id="senderInput"
                                    />
                                </div>
                                <div className="col-6">
                                    <Input
                                        ref={register}
                                        name="to"
                                        required
                                        className="mb-4"
                                        onChange={(event) => setRecipientAddress(event.target.value)}
                                        inputClass="form-control"
                                        value={recipientAddress}
                                        label="Recipient"
                                        id="recipientInput"
                                    />
                                </div>
                                <div className="col-6">
                                    <Input
                                        ref={register}
                                        name="amount"
                                        required
                                        className="mb-4"
                                        inputClass="form-control"
                                        onChange={(event) => {
                                            setAmount(event.target.value);
                                            setFees((parseFloat(event.target.value) / 10).toFixed(5));
                                        }}
                                        value={amount}
                                        type="number"
                                        label="Amount"
                                        id="amountInput"
                                    />
                                </div>
                                <div className="col-6">
                                    <Input inputClass="form-control" value={fees} disabled label="Transaction Fees" />
                                </div>
                                <div className="col">
                                    <button className="btn btn-primary" type="submit">
                                        {t('common.send')}
                                    </button>
                                </div>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Send;

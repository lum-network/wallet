import { Card, Input } from 'components';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch, RootState } from 'redux/store';

const Send = (): JSX.Element => {
    const address = useSelector((state: RootState) => state.wallet.address);
    const [senderAddress, setSenderAddress] = useState(address || '');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [fees, setFees] = useState('');

    const { sendTx } = useRematchDispatch((dispatch: RootDispatch) => ({
        sendTx: dispatch.wallet.sendTx,
    }));
    const { register, handleSubmit } = useForm();

    const onSend = (data: { to: string; amount: number }) => {
        sendTx({
            ...data,
            from: senderAddress,
            amount: Number(amount),
            ticker: 'LUM',
        });
    };

    return (
        <div className="pt-4">
            <Card className="px-3 py-2">
                <h4>Send transaction</h4>
                <form onSubmit={handleSubmit(onSend)} className="row">
                    <div className="col-6">
                        <Input
                            ref={register}
                            name="from"
                            disabled
                            className="mb-4"
                            value={senderAddress}
                            inputClass="form-control"
                            onChange={(event) => setSenderAddress(event.target.value)}
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
                            Send
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Send;

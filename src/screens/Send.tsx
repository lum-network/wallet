import React from 'react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch, RootState } from 'redux/store';

import { Card } from 'frontend-elements';
import { AddressCard, BalanceCard, Input } from 'components';
import { Redirect } from 'react-router';

const Send = (): JSX.Element => {
    // Redux hooks
    const { wallet, currentBalance } = useSelector((state: RootState) => ({
        wallet: state.wallet.currentWallet,
        currentBalance: state.wallet.currentBalance,
    }));
    const { sendTx } = useRematchDispatch((dispatch: RootDispatch) => ({
        sendTx: dispatch.wallet.sendTx,
    }));

    if (!wallet) {
        return <Redirect to="/welcome" />;
    }

    // Form hook
    const formik = useFormik({
        initialValues: {
            from: wallet.address,
            to: '',
            amount: '',
            fees: '',
        },
        onSubmit: (values) => onSend(values.to, values.amount),
    });

    // Utils hooks
    const { t } = useTranslation();

    // Methods
    const onSend = (to: string, amount: string) => {
        sendTx({
            to,
            from: wallet,
            amount,
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
                            <form onSubmit={formik.handleSubmit} className="row">
                                <div className="col-6">
                                    <Input
                                        {...formik.getFieldProps('from')}
                                        disabled
                                        className="mb-4"
                                        inputClass="form-control"
                                        label="Sender"
                                        id="senderInput"
                                    />
                                </div>
                                <div className="col-6">
                                    <Input
                                        {...formik.getFieldProps('to')}
                                        required
                                        className="mb-4"
                                        inputClass="form-control"
                                        label="Recipient"
                                        id="recipientInput"
                                    />
                                </div>
                                <div className="col-6">
                                    <Input
                                        {...formik.getFieldProps('amount')}
                                        required
                                        className="mb-4"
                                        inputClass="form-control"
                                        onChange={(event) => {
                                            formik.handleChange(event);
                                            formik.setFieldValue(
                                                'fees',
                                                (parseFloat(event.target.value) / 10).toFixed(5),
                                            );
                                        }}
                                        type="number"
                                        label="Amount"
                                        id="amountInput"
                                    />
                                </div>
                                <div className="col-6">
                                    <Input
                                        {...formik.getFieldProps('fees')}
                                        inputClass="form-control"
                                        disabled
                                        label="Transaction Fees"
                                    />
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

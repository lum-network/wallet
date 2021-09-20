import { Input, Button as CustomButton } from 'components';
import { FormikContextType } from 'formik';
import { Button } from 'frontend-elements';
import React, { useState } from 'react';

interface Props {
    isLoading: boolean;
    form: FormikContextType<{
        amount: string;
        memo: string;
        address: string;
    }>;
}

const Send = ({ form, isLoading }: Props): JSX.Element => {
    const [confirming, setConfirming] = useState(false);

    return (
        <>
            {confirming && <h6 className="mt-3">Confirmation</h6>}
            <form className="row w-100 align-items-start text-start mt-3">
                <div className="col-12">
                    <Input
                        {...form.getFieldProps('amount')}
                        value={form.values.amount}
                        readOnly={confirming}
                        autoComplete="off"
                        placeholder="Amount"
                        label="Amount"
                    />
                    {form.touched.amount && form.errors.amount && (
                        <p className="ms-2 color-error">{form.errors.amount}</p>
                    )}
                </div>
                <div className="col-12 mt-4">
                    <Input
                        {...form.getFieldProps('address')}
                        readOnly={confirming}
                        placeholder="To address"
                        label="To Address"
                    />
                    {form.touched.address && form.errors.address && (
                        <p className="ms-2 color-error">{form.errors.address}</p>
                    )}
                </div>
                <div className="col-12 mt-4">
                    {(!confirming || (confirming && form.values.memo)) && (
                        <Input
                            {...form.getFieldProps('memo')}
                            readOnly={confirming}
                            placeholder="Memo"
                            label="Memo (optional)"
                        />
                    )}
                    {form.touched.memo && form.errors.memo && <p className="ms-2 color-error">{form.errors.memo}</p>}
                </div>
                <div className="justify-content-center mt-4 col-10 offset-1 col-sm-6 offset-sm-3">
                    <Button loading={isLoading} onPress={confirming ? form.handleSubmit : () => setConfirming(true)}>
                        {confirming ? 'Send' : 'Continue'}
                    </Button>
                    {confirming && (
                        <CustomButton
                            className="bg-transparent text-btn mt-2 mx-auto"
                            onClick={() => {
                                setConfirming(false);
                            }}
                        >
                            Modify
                        </CustomButton>
                    )}
                </div>
            </form>
        </>
    );
};

export default Send;

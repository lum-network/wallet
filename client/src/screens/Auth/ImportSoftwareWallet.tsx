import React from 'react';
import { useParams } from 'react-router-dom';

const ImportSoftwareWallet = (): JSX.Element => {
    const { type } = useParams<{ type: string }>();

    return <div>Import Software Wallet with type {type}</div>;
};

export default ImportSoftwareWallet;

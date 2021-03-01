import React from 'react';
import Assets from 'assets';

const Header = (): JSX.Element => (
    <div className="mt-4 auth-header">
        <img className="mt-4" src={Assets.images.lumWallet} width="180" height="48" />
    </div>
);

export default Header;

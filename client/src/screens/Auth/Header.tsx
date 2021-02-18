import React from 'react';
import Assets from 'assets';

const Header = (): JSX.Element => (
    <div className="mt-4">
        <img className="mt-4 mb-4 mb-lg-0" src={Assets.images.lumWallet} width="180" height="48" />
    </div>
);

export default Header;

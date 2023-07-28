import assets from 'assets';
import { IBCDenoms } from 'constant';

export const computeDenom = (denom: string): string => {
    switch (denom) {
        case IBCDenoms.USDC:
            return 'usdc';
        case IBCDenoms.ATOM_TESTNET:
        case IBCDenoms.ATOM:
            return 'atom';
        case IBCDenoms.OSMO:
            return 'osmo';
        case 'udfr':
            return 'dfr';
        default:
            return 'lum';
    }
};

export const getIconFromDenom = (denom: string) => {
    switch (denom) {
        case 'atom':
            return assets.images.tokens.atom;
        case 'osmo':
            return assets.images.tokens.osmo;
        case 'dfr':
            return assets.images.tokens.dfr;
        case 'usdc':
            return assets.images.tokens.usdc;
    }
};

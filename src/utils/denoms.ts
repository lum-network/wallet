import { IBCDenoms } from 'constant';

export const computeDenom = (denom: string): string => {
    switch (denom) {
        case IBCDenoms.USDC:
            return 'usdc';
        case 'udfr':
            return 'dfr';
        default:
            return 'lum';
    }
};

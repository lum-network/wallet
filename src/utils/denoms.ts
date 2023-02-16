const enum IBCDenoms {
    USDC = 'ibc/05554A9BFDD28894D7F18F4C707AA0930D778751A437A9FE1F4684A3E1199728',
}

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

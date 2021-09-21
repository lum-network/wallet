import { LumConstants, LumUtils } from '@lum-network/sdk-javascript';

export const convertUnitNumber = (nb: number | string): number => {
    let amount: string;

    if (typeof nb === 'string') {
        const split = nb.split('.');

        amount = split[0];
    } else {
        amount = nb.toFixed();
    }

    const coin = {
        amount,
        denom: LumConstants.MicroLumDenom,
    };

    return parseFloat(LumUtils.convertUnit(coin, LumConstants.LumDenom));
};

import { LumConstants, LumTypes, LumUtils } from '@lum-network/sdk-javascript';
import numeral from 'numeral';

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

export const formatUnit = (coin: LumTypes.Coin, moreDecimal?: boolean): string => {
    return numeral(LumUtils.convertUnit(coin, LumConstants.LumDenom)).format(moreDecimal ? '0,0.000000' : '0,0.000');
};

export const formatTo6digit = (number: number): string => (number > 0 ? numeral(number).format('0,0.000000') : '0');

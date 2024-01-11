import numeral from 'numeral';

import { LUM_DENOM, MICRO_LUM_DENOM, convertUnit } from '@lum-network/sdk-javascript';
import { Coin } from '@lum-network/sdk-javascript/build/codegen/cosmos/base/v1beta1/coin';

export const convertUnitNumber = (nb: number | string, fromDenom = MICRO_LUM_DENOM, toDenom = LUM_DENOM): number => {
    let amount: string;

    if (!nb) {
        return 0;
    }

    if (typeof nb === 'string') {
        const split = nb.split('.');

        amount = split[0];
    } else {
        amount = nb.toFixed(fromDenom.startsWith('u') ? 0 : 6);
    }

    const coin = {
        amount,
        denom: fromDenom,
    };

    return parseFloat(convertUnit(coin, toDenom));
};

export const formatUnit = (coin: Coin, moreDecimal?: boolean): string => {
    return numeral(convertUnit(coin, LUM_DENOM)).format(moreDecimal ? '0,0.000000' : '0,0.000');
};

export const formatTo6digit = (number: number): string => (number > 0 ? numeral(number).format('0,0.000000') : '0');

export const getPercentage = (nb: number, total: number): number => {
    if (!total) {
        return 0;
    }

    return (nb / total) * 100;
};

export const getDifferencePercentage = (nb1: number, nb2: number): number => {
    if (nb1 === 0) {
        return 0;
    }

    let sign = 1;

    if (nb1 > nb2) {
        sign = -1;
    }

    return (Math.abs(nb1 - nb2) / nb1) * sign;
};

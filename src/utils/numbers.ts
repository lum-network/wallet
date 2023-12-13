import { Coin } from '@lum-network/sdk-javascript/build/codegen/cosmos/base/v1beta1/coin';
import { LumConstants } from 'constant';
import numeral from 'numeral';

export const convertUnit = (coin: Coin, toDenom: string): string => {
    const parts = coin.amount.split('.');
    if (parts.length > 2) {
        throw new Error('More than one separator found');
    }

    if (coin.denom === toDenom) {
        return coin.amount;
    } else if (coin.denom.startsWith('u') && coin.denom.endsWith(toDenom)) {
        // from micro to base
        if (parts.length !== 1) {
            throw new Error('Micro units cannot have floating precision');
        }
        let res = parts[0];
        for (let i = res.length; res.length <= LumConstants.LumExponent; i++) {
            res = '0' + res;
        }
        const floatIdx = res.length - LumConstants.LumExponent;
        return (res.substring(0, floatIdx) + '.' + res.substring(floatIdx)).replace(/0+$/, '');
    } else if (toDenom.startsWith('u') && toDenom.endsWith(coin.denom)) {
        // form base to micro
        if (parts.length === 2 && parts[1].length > LumConstants.LumExponent) {
            throw new Error(`Floating precision cannot exceed ${LumConstants.LumExponent} digits`);
        }
        let res = parts[0] + (parts[1] || '');
        for (let i = parts.length === 2 ? parts[1].length : 0; i < LumConstants.LumExponent; i++) {
            res += '0';
        }
        return res.replace(/^0+/, '');
    }
    return coin.amount;
};

export const convertUnitNumber = (
    nb: number | string,
    fromDenom = LumConstants.MicroLumDenom,
    toDenom = LumConstants.LumDenom,
): number => {
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
    return numeral(convertUnit(coin, LumConstants.LumDenom)).format(moreDecimal ? '0,0.000000' : '0,0.000');
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

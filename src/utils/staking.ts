import { Validator } from '@lum-network/sdk-javascript/build/codec/cosmos/staking/v1beta1/staking';
import { NumbersUtils } from '.';

export const calculateTotalVotingPower = (validators: Validator[]): number => {
    if (!validators || !validators.length) {
        return 0;
    }

    return validators.reduce((acc, validator) => acc + parseFloat(validator.tokens || '0'), 0);
};

export const sortByVotingPower = (validators: Validator[], totalVotingPower: number): Validator[] => {
    return validators.sort((valA, valB) => {
        if (totalVotingPower > 0) {
            return (
                NumbersUtils.convertUnitNumber(valB.tokens || 0) / totalVotingPower -
                NumbersUtils.convertUnitNumber(valA.tokens || 0) / totalVotingPower
            );
        }
        return 0;
    });
};

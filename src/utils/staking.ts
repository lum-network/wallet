import { Validator } from '@lum-network/sdk-javascript/build/codec/cosmos/staking/v1beta1/staking';

export const calculateTotalVotingPower = (validators: Validator[]): number => {
    if (!validators || !validators.length) {
        return 0;
    }

    return validators.reduce((acc, validator) => acc + parseFloat(validator.tokens || '0'), 0);
};

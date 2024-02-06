import {
    DelegationResponse,
    UnbondingDelegation,
    Validator,
} from '@lum-network/sdk-javascript/build/codegen/cosmos/staking/v1beta1/staking';
import { CLIENT_PRECISION } from 'constant';
import { Rewards, UserValidator } from 'models';
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

export const unbondingsTimeRemaining = (unbondings: UnbondingDelegation[]): Date | undefined => {
    let time = undefined;

    for (const unbonding of unbondings) {
        for (const entry of unbonding.entries) {
            if (!time) {
                time = entry.completionTime;
            } else {
                if (entry.completionTime && entry.completionTime < time) {
                    time = entry.completionTime;
                }
            }
        }
    }

    return time;
};

export const getUserValidators = (
    validatorsList: Validator[],
    delegations: DelegationResponse[],
    rewards: Rewards,
): UserValidator[] => {
    const validators = [];

    for (const delegation of delegations) {
        const validator = validatorsList.find(
            (bondedVal) =>
                delegation.delegation && bondedVal.operatorAddress === delegation.delegation.validatorAddress,
        );
        if (validator) {
            if (rewards.rewards.length === 0) {
                validators.push({
                    ...validator,
                    reward: 0,
                    stakedCoins: NumbersUtils.formatTo6digit(
                        NumbersUtils.convertUnitNumber(delegation.balance?.amount || '0'),
                    ),
                });
            } else {
                const valReward = rewards.rewards.find(
                    (r) => delegation.delegation && r.validatorAddress === delegation.delegation.validatorAddress,
                );

                validators.push({
                    ...validator,
                    reward:
                        parseFloat(valReward && valReward.reward.length > 0 ? valReward.reward[0].amount : '0') /
                        CLIENT_PRECISION,
                    stakedCoins: NumbersUtils.formatTo6digit(
                        NumbersUtils.convertUnitNumber(delegation.balance?.amount || '0'),
                    ),
                });
            }
        }
    }

    return validators;
};

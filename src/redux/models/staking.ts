import { createModel } from '@rematch/core';
import { RootModel } from '../../models';
import {
    DelegationResponse,
    UnbondingDelegation,
    Validator,
} from '@lum-network/sdk-javascript/build/codec/cosmos/staking/v1beta1/staking';
import { WalletClient } from 'utils';

interface StakingState {
    validators: {
        unbonded: Validator[];
        bonded: Validator[];
    };
    delegations: DelegationResponse[];
    unbondings: UnbondingDelegation[];
    unbondedTokens: number;
    stakedCoins: number;
}

export const staking = createModel<RootModel>()({
    name: 'staking',
    state: {
        validators: {
            bonded: [],
            unbonded: [],
        },
        delegations: [],
        unbondings: [],
        unbondedTokens: 0,
        stakedCoins: 0,
    } as StakingState,
    reducers: {
        setData(
            state,
            data: {
                bonded: Validator[];
                unbonded: Validator[];
                delegations: DelegationResponse[];
                unbondings: UnbondingDelegation[];
                unbondedTokens: number;
                stakedCoins: number;
            },
        ) {
            const { bonded, unbonded, delegations, unbondings, unbondedTokens, stakedCoins } = data;

            return {
                ...state,
                bonded,
                unbondedTokens,
                delegations,
                unbondings,
                stakedCoins,
                validators: {
                    bonded,
                    unbonded,
                },
            };
        },
    },
    effects: (dispatch) => ({
        async getValidatorsInfosAsync(payload: string) {
            const infos = await WalletClient.getValidatorsInfos(payload);

            if (infos) {
                dispatch.staking.setData(infos);
            }
        },
    }),
});

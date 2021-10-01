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
            state.validators.bonded = data.bonded;
            state.validators.unbonded = data.unbonded;
            state.delegations = data.delegations;
            state.unbondings = data.unbondings;
            state.stakedCoins = data.stakedCoins;
            state.unbondedTokens = data.unbondedTokens;

            return state;
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

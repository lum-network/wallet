import { Proposal } from '@lum-network/sdk-javascript/build/codec/cosmos/gov/v1beta1/gov';
import { createModel } from '@rematch/core';
import { RootModel } from 'models';
import { WalletClient } from 'utils';

interface GovernanceState {
    proposals: Proposal[];
}

export const governance = createModel<RootModel>()({
    name: 'governance',
    state: {
        proposals: [],
    } as GovernanceState,
    reducers: {
        setProposals(state, proposals: Proposal[]) {
            return {
                ...state,
                proposals,
            };
        },
    },
    effects: (dispatch) => ({
        async getProposals() {
            const proposals = await WalletClient.getProposals();

            if (proposals) {
                dispatch.governance.setProposals(proposals);
            }
        },
    }),
});

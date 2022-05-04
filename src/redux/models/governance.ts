import { createModel } from '@rematch/core';
import { Proposal, RootModel } from 'models';
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
        async getTally(id: string) {
            const result = await WalletClient.getProposalTally(id);

            return result;
        },
    }),
});

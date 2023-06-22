import { createModel } from '@rematch/core';
import { RootModel, TokenModel } from 'models';
import { StatsApi } from 'utils';

interface StatsState {
    prices: TokenModel[];
}

export const stats = createModel<RootModel>()({
    name: 'stats',
    state: {
        prices: [],
    } as StatsState,
    reducers: {
        setPrices(state, prices: TokenModel[]) {
            return {
                ...state,
                prices,
            };
        },
    },
    effects: (dispatch) => ({
        async getPrices() {
            const [res] = await StatsApi.getPrices();

            dispatch.stats.setPrices(res);
        },
    }),
});

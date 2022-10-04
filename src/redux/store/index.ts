import { RematchDispatch, RematchRootState, init } from '@rematch/core';
import loadingPlugin, { ExtraModelsFromLoading } from '@rematch/loading';

import { RootModel, reduxModels } from 'models';

type FullModel = ExtraModelsFromLoading<RootModel, { type: 'full' }>;

const store = init<RootModel, FullModel>({
    models: reduxModels,
    redux: {
        rootReducers: {
            LOGOUT: () => {
                const backdrops = document.querySelectorAll('.modal-backdrop');

                backdrops.forEach((backdrop) => backdrop.remove());
                return undefined;
            },
        },
    },
    plugins: [loadingPlugin({ type: 'full' })],
});

export type Store = typeof store;
export type RootDispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel, FullModel>;

export default store;

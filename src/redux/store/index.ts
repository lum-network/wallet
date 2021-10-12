import { RematchDispatch, RematchRootState, init } from '@rematch/core';
import loadingPlugin, { ExtraModelsFromLoading } from '@rematch/loading';
import selectPlugin from '@rematch/select';
import immerPlugin from '@rematch/immer';

import { RootModel, reduxModels } from 'models';

type FullModel = ExtraModelsFromLoading<RootModel, { type: 'full' }>;

const store = init<RootModel, FullModel>({
    models: reduxModels,
    redux: {
        rootReducers: {
            LOGOUT: () => undefined,
        },
    },
    plugins: [loadingPlugin({ type: 'full' }), selectPlugin(), immerPlugin()],
});

export const { select } = store;

export type Store = typeof store;
export type RootDispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel, FullModel>;

export default store;

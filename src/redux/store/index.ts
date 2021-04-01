import { RematchDispatch, RematchRootState, init } from '@rematch/core';
import loadingPlugin, { ExtraModelsFromLoading } from '@rematch/loading';
import selectPlugin from '@rematch/select';
import immerPlugin from '@rematch/immer';

import { RootModel, reduxModels } from 'models';

type FullModel = ExtraModelsFromLoading<RootModel>;

const store = init<RootModel, FullModel>({
    models: reduxModels,
    redux: {
        rootReducers: {
            LOGOUT: () => undefined,
        },
    },
    plugins: [loadingPlugin(), selectPlugin(), immerPlugin()],
});

export const { select } = store;

export type Store = typeof store;
export type RootDispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;

export default store;

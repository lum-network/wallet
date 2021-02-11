import { RematchDispatch, RematchRootState, init } from '@rematch/core';
import loadingPlugin, { ExtraModelsFromLoading } from '@rematch/loading';
import persistPlugin, { getPersistor } from '@rematch/persist';
import selectPlugin from '@rematch/select';
import storage from 'redux-persist/lib/storage';

import { RootModel, reduxModels } from 'models';

type FullModel = ExtraModelsFromLoading<RootModel>;

const persistConfig = {
    key: 'root',
    storage,
};

const store = init<RootModel, FullModel>({
    models: reduxModels,
    plugins: [loadingPlugin(), persistPlugin(persistConfig), selectPlugin()],
});

export const persistor = getPersistor();

export const { select } = store;

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;

export default store;

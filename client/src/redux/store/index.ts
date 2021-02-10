import { RematchDispatch, RematchRootState, init } from '@rematch/core';
import models, { RootModel } from '../models';
import loadingPlugin, { ExtraModelsFromLoading } from '@rematch/loading';
import persistPlugin, { getPersistor } from '@rematch/persist';
import storage from 'redux-persist/lib/storage';

type FullModel = ExtraModelsFromLoading<RootModel>;

const persistConfig = {
    key: 'root',
    storage,
};

const store = init<RootModel, FullModel>({
    models,
    plugins: [loadingPlugin(), persistPlugin(persistConfig)],
});

export const persistor = getPersistor();

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;

export default store;

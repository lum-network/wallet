import { Models } from '@rematch/core';
import { wallet } from '../wallet';

export interface RootModel extends Models<RootModel> {
    wallet: typeof wallet;
}

const models: RootModel = { wallet };

export default models;

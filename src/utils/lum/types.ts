import { Pubkey } from '@cosmjs/amino';
import { ModuleAccount } from '@lum-network/sdk-javascript/build/codegen/cosmos/auth/v1beta1/auth';
import {
    BaseVestingAccount,
    ContinuousVestingAccount,
    DelayedVestingAccount,
    PeriodicVestingAccount,
} from '@lum-network/sdk-javascript/build/codegen/cosmos/vesting/v1beta1/vesting';

export interface Account {
    readonly address: string;
    readonly accountNumber: number;
    readonly sequence: number;
    readonly pubkey: Pubkey | null;
    readonly _moduleAccount?: ModuleAccount;
    readonly _baseVestingAccount?: BaseVestingAccount;
    readonly _continuousVestingAccount?: ContinuousVestingAccount;
    readonly _delayedVestingAccount?: DelayedVestingAccount;
    readonly _periodicVestingAccount?: PeriodicVestingAccount;
}

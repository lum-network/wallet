import { decodePubkey } from '@cosmjs/proto-signing';
import { assert } from '@cosmjs/utils';
import { BaseAccount, ModuleAccount } from '@lum-network/sdk-javascript/build/codegen/cosmos/auth/v1beta1/auth';
import {
    BaseVestingAccount,
    ContinuousVestingAccount,
    DelayedVestingAccount,
    PeriodicVestingAccount,
} from '@lum-network/sdk-javascript/build/codegen/cosmos/vesting/v1beta1/vesting';
import { Any } from '@lum-network/sdk-javascript/build/codegen/google/protobuf/any';
import { Account } from './types';

function accountFromBaseAccount(input: BaseAccount): Account {
    const { address, pubKey, accountNumber, sequence } = input;
    const pubkey = pubKey ? decodePubkey(pubKey) : null;

    return {
        address: address,
        pubkey: pubkey,
        accountNumber: Number(accountNumber),
        sequence: Number(sequence),
    };
}

export const accountFromAny = (input: Any): Account => {
    const { typeUrl, value } = input;
    switch (typeUrl) {
        case '/cosmos.auth.v1beta1.BaseAccount':
            return accountFromBaseAccount(BaseAccount.decode(value));
        case '/cosmos.auth.v1beta1.ModuleAccount': {
            const moduleAccount = ModuleAccount.decode(value);
            assert(moduleAccount.baseAccount);
            return Object.assign(accountFromBaseAccount(moduleAccount.baseAccount), { _moduleAccount: moduleAccount });
        }
        case '/cosmos.vesting.v1beta1.BaseVestingAccount': {
            const vestingAccount = BaseVestingAccount.decode(value);
            assert(vestingAccount.baseAccount);
            return Object.assign(accountFromBaseAccount(vestingAccount.baseAccount), {
                _baseVestingAccount: vestingAccount,
            });
        }
        case '/cosmos.vesting.v1beta1.ContinuousVestingAccount': {
            const vestingAccount = ContinuousVestingAccount.decode(value);
            assert(vestingAccount.baseVestingAccount);
            assert(vestingAccount.baseVestingAccount.baseAccount);
            return Object.assign(accountFromBaseAccount(vestingAccount.baseVestingAccount.baseAccount), {
                _continuousVestingAccount: vestingAccount,
            });
        }
        case '/cosmos.vesting.v1beta1.DelayedVestingAccount': {
            const vestingAccount = DelayedVestingAccount.decode(value);
            assert(vestingAccount.baseVestingAccount);
            assert(vestingAccount.baseVestingAccount.baseAccount);
            return Object.assign(accountFromBaseAccount(vestingAccount.baseVestingAccount.baseAccount), {
                _delayedVestingAccount: vestingAccount,
            });
        }
        case '/cosmos.vesting.v1beta1.PeriodicVestingAccount': {
            const vestingAccount = PeriodicVestingAccount.decode(value);
            assert(vestingAccount.baseVestingAccount);
            assert(vestingAccount.baseVestingAccount.baseAccount);
            return Object.assign(accountFromBaseAccount(vestingAccount.baseVestingAccount.baseAccount), {
                _periodicVestingAccount: vestingAccount,
            });
        }
        default:
            throw new Error(`Unsupported type: '${typeUrl}'`);
    }
};

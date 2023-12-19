import { Uint64 } from '@cosmjs/math';
import { Account } from './types';
import { LumConstants } from 'constant';
import { Coin } from '@lum-network/sdk-javascript/build/codegen/cosmos/base/v1beta1/coin';

const uint64ProtoToDate = (input: bigint): Date => {
    return new Date(Number(input) * 1000);
};

// estimatedVesting returns vesting information for an account and a denom
// throws an error if the account is not a vesting account
// totalCoins: Total vesting coins
// unlockedCoins: Total unlocked coins (aka vested coins)
// lockedCoins: Total locked coins (aka vesting coins)
// lockedDelegatedCoins: Total locked coins delegated (note: this amount is confusing since it is from the time it was delegated)
// lockedBankCoins: Total locked coins actually in "available" in the bank (note: substract this from the bank to get what an account can freely use)
export const estimatedVesting = (
    account: Account,
    t?: Date,
    denom = LumConstants.MicroLumDenom,
): {
    startsAt: Date;
    endsAt: Date;
    time: Date;
    unlockedPercentage: number;
    lockedPercentage: number;
    totalCoins: Coin;
    unlockedCoins: Coin;
    lockedCoins: Coin;
    lockedDelegatedCoins: Coin;
    lockedBankCoins: Coin;
} => {
    if (!t) {
        t = new Date();
    }

    if (account._continuousVestingAccount && account._continuousVestingAccount.baseVestingAccount) {
        const startsAt = uint64ProtoToDate(account._continuousVestingAccount.startTime);
        const endsAt = uint64ProtoToDate(account._continuousVestingAccount.baseVestingAccount.endTime);
        const totalCoins: Coin = { amount: '0', denom: denom };
        for (const c of account._continuousVestingAccount.baseVestingAccount.originalVesting) {
            if (c.denom === denom) {
                totalCoins.amount = c.amount;
                break;
            }
        }
        const lockedDelegatedCoins: Coin = { amount: '0', denom: denom };
        for (const c of account._continuousVestingAccount.baseVestingAccount.delegatedVesting) {
            if (c.denom === denom) {
                lockedDelegatedCoins.amount = c.amount;
                break;
            }
        }

        const elapsed = t.getTime() - startsAt.getTime();
        const delta = endsAt.getTime() - startsAt.getTime();
        const doneRatio = Math.min(1.0, Math.max(0, elapsed / delta));
        const unlockedCoins = { amount: `${Math.ceil(parseInt(totalCoins.amount) * doneRatio)}`, denom };
        const lockedCoins = { amount: `${Math.ceil(parseInt(totalCoins.amount) * (1.0 - doneRatio))}`, denom };
        const lockedBankCoins = {
            amount: `${Math.max(0, parseInt(lockedCoins.amount) - parseInt(lockedDelegatedCoins.amount))}`,
            denom,
        };

        return {
            startsAt: startsAt,
            endsAt: endsAt,
            time: t,
            unlockedPercentage: doneRatio * 100.0,
            lockedPercentage: (1.0 - doneRatio) * 100.0,
            totalCoins,
            unlockedCoins,
            lockedCoins,
            lockedDelegatedCoins,
            lockedBankCoins,
        };
    } else if (account._delayedVestingAccount && account._delayedVestingAccount.baseVestingAccount) {
        const endsAt = uint64ProtoToDate(account._delayedVestingAccount.baseVestingAccount.endTime);
        const startsAt = endsAt;
        const totalCoins: Coin = { amount: '0', denom: denom };
        for (const c of account._delayedVestingAccount.baseVestingAccount.originalVesting) {
            if (c.denom === denom) {
                totalCoins.amount = c.amount;
                break;
            }
        }
        const lockedDelegatedCoins: Coin = { amount: '0', denom: denom };
        for (const c of account._delayedVestingAccount.baseVestingAccount.delegatedVesting) {
            if (c.denom === denom) {
                lockedDelegatedCoins.amount = c.amount;
                break;
            }
        }

        const doneRatio = t > endsAt ? 1 : 0;
        const unlockedCoins = { amount: `${Math.ceil(parseInt(totalCoins.amount) * doneRatio)}`, denom };
        const lockedCoins = { amount: `${Math.ceil(parseInt(totalCoins.amount) * (1.0 - doneRatio))}`, denom };
        const lockedBankCoins = {
            amount: `${Math.max(0, parseInt(lockedCoins.amount) - parseInt(lockedDelegatedCoins.amount))}`,
            denom,
        };

        return {
            startsAt: startsAt,
            endsAt: endsAt,
            time: t,
            unlockedPercentage: doneRatio * 100.0,
            lockedPercentage: (1.0 - doneRatio) * 100.0,
            totalCoins,
            unlockedCoins,
            lockedCoins,
            lockedDelegatedCoins,
            lockedBankCoins,
        };
    } else if (account._periodicVestingAccount && account._periodicVestingAccount.baseVestingAccount) {
        const startsAt = uint64ProtoToDate(account._periodicVestingAccount.startTime);
        const endsAt = uint64ProtoToDate(account._periodicVestingAccount.baseVestingAccount.endTime);
        const totalCoins: Coin = { amount: '0', denom: denom };
        for (const c of account._periodicVestingAccount.baseVestingAccount.originalVesting) {
            if (c.denom === denom) {
                totalCoins.amount = c.amount;
                break;
            }
        }
        const lockedDelegatedCoins: Coin = { amount: '0', denom: denom };
        for (const c of account._periodicVestingAccount.baseVestingAccount.delegatedVesting) {
            if (c.denom === denom) {
                lockedDelegatedCoins.amount = c.amount;
                break;
            }
        }

        let doneAmount = 0;
        let currentTime = startsAt.getTime();
        for (const p of account._periodicVestingAccount.vestingPeriods) {
            const pDuration = Uint64.fromString(p.length.toString()).toNumber() * 1000;
            if (t < new Date(currentTime + pDuration)) {
                break;
            }
            currentTime += pDuration;
            for (const c of p.amount) {
                if (c.denom === denom) {
                    doneAmount += parseInt(c.amount);
                    break;
                }
            }
        }

        const doneRatio = doneAmount / parseFloat(totalCoins.amount);
        const unlockedCoins = { amount: `${Math.ceil(parseInt(totalCoins.amount) * doneRatio)}`, denom };
        const lockedCoins = { amount: `${Math.ceil(parseInt(totalCoins.amount) * (1.0 - doneRatio))}`, denom };
        const lockedBankCoins = {
            amount: `${Math.max(0, parseInt(lockedCoins.amount) - parseInt(lockedDelegatedCoins.amount))}`,
            denom,
        };

        return {
            startsAt: startsAt,
            endsAt: endsAt,
            time: t,
            unlockedPercentage: doneRatio * 100.0,
            lockedPercentage: (1.0 - doneRatio) * 100.0,
            totalCoins,
            unlockedCoins,
            lockedCoins,
            lockedDelegatedCoins,
            lockedBankCoins,
        };
    }

    throw 'not a vesting account';
};

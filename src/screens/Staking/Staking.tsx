import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Redirect } from 'react-router';
import { Card } from 'frontend-elements';
import { RootDispatch, RootState } from 'redux/store';
import { useRematchDispatch } from 'redux/hooks';
import { BalanceCard } from 'components';
import { UserValidator } from 'models';

import StakedCoinsCard from './components/Cards/StakedCoinsCard';
import UnbondedTokensCard from './components/Cards/UnbondedTokensCard';
import RewardsCard from './components/Cards/RewardsCard';
import MyValidators from './components/Lists/MyValidators';
import { CLIENT_PRECISION } from 'constant';
import { NumbersUtils } from 'utils';
import AvailableValidators from './components/Lists/AvailableValidators';

const Staking = (): JSX.Element => {
    const [userValidators, setUserValidators] = useState<UserValidator[]>([]);

    const {
        bondedValidators,
        unbondedValidators,
        stakedCoins,
        unbondedTokens,
        wallet,
        rewards,
        balance,
        delegations,
        unbondings,
    } = useSelector((state: RootState) => ({
        wallet: state.wallet.currentWallet,
        balance: state.wallet.currentBalance,
        rewards: state.wallet.rewards,
        bondedValidators: state.staking.validators.bonded,
        unbondedValidators: state.staking.validators.unbonded,
        delegations: state.staking.delegations,
        unbondings: state.staking.unbondings,
        stakedCoins: state.staking.stakedCoins,
        unbondedTokens: state.staking.unbondedTokens,
    }));

    const { getValidatorsInfos } = useRematchDispatch((dispatch: RootDispatch) => ({
        getValidatorsInfos: dispatch.staking.getValidatorsInfosAsync,
    }));

    useEffect(() => {
        if (wallet) {
            getValidatorsInfos(wallet.getAddress());
        }
    }, [getValidatorsInfos, wallet]);

    useEffect(() => {
        const validators: UserValidator[] = [];

        for (const delegation of delegations) {
            for (const reward of rewards.rewards) {
                if (delegation.delegation && reward.validatorAddress === delegation.delegation.validatorAddress) {
                    const validator = bondedValidators.find(
                        (bondedVal) =>
                            delegation.delegation &&
                            bondedVal.operatorAddress === delegation.delegation.validatorAddress,
                    );

                    if (validator) {
                        validators.push({
                            ...validator,
                            reward:
                                parseFloat(reward.reward.length > 0 ? reward.reward[0].amount : '0') / CLIENT_PRECISION,
                            stakedCoins: NumbersUtils.formatTo6digit(
                                NumbersUtils.convertUnitNumber(delegation.delegation.shares || 0) / CLIENT_PRECISION,
                            ),
                        });
                    }
                }
            }
        }
        setUserValidators(validators);
    }, [delegations, unbondings, bondedValidators, unbondedValidators, rewards]);

    if (!wallet) {
        return <Redirect to="/welcome" />;
    }

    return (
        <div className="mt-4">
            <div className="container">
                <div className="row gy-4">
                    <div className="col-md-6">
                        <StakedCoinsCard amount={stakedCoins} />
                    </div>
                    <div className="col-md-6">
                        <BalanceCard balance={balance} address={wallet.getAddress()} />
                    </div>
                    <div className="col-md-6">
                        <UnbondedTokensCard amount={unbondedTokens} />
                    </div>
                    <div className="col-md-6">
                        <RewardsCard rewards={rewards} />
                    </div>
                    <div className="col">
                        <Card withoutPadding>
                            <MyValidators validators={userValidators} />
                        </Card>
                    </div>
                    <div className="col">
                        <Card withoutPadding>
                            <AvailableValidators validators={bondedValidators} />
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Staking;

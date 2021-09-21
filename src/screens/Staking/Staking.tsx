import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootDispatch, RootState } from 'redux/store';
import { Card } from 'frontend-elements';
import { useRematchDispatch } from 'redux/hooks';
import { BalanceCard } from 'components';
import { Redirect } from 'react-router';

import StakedCoinsCard from './components/Cards/StakedCoinsCard';
import UnbondedTokensCard from './components/Cards/UnbondedTokensCard';
import RewardsCard from './components/Cards/RewardsCard';
import MyValidators from './components/Lists/MyValidators';
import { Validator } from '@lum-network/sdk-javascript/build/codec/cosmos/staking/v1beta1/staking';
import { LumTypes } from '@lum-network/sdk-javascript';

interface UserValidator extends Validator {
    balance: LumTypes.Coin;
}

const Staking = (): JSX.Element => {
    const [userValidators, setUserValidators] = useState<UserValidator[]>([]);

    const {
        bondedValidators,
        unbondedValidators,
        stakedCoins,
        unbondedTokens,
        wallet,
        balance,
        delegations,
        unbondings,
    } = useSelector((state: RootState) => ({
        wallet: state.wallet.currentWallet,
        balance: state.wallet.currentBalance,
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
        const validators = [];

        //setUserValidators();
    }, [delegations, unbondings, bondedValidators, unbondedValidators]);

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
                        <RewardsCard />
                    </div>
                    <div className="col">
                        <Card withoutPadding>
                            <MyValidators validators={[...bondedValidators, ...unbondedValidators]} />
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Staking;

import {
    LumClient,
    LumConstants,
    LumMessages,
    LumRegistry,
    LumTypes,
    LumUtils,
    LumWallet,
} from '@lum-network/sdk-javascript';
import { TxResponse } from '@cosmjs/tendermint-rpc';
import { LUM_TESTNET } from 'constant';
import { PasswordStrengthType, PasswordStrength, Transaction, Amount } from 'models';

export type MnemonicLength = 12 | 24;

export const checkMnemonicLength = (length: number): length is MnemonicLength => {
    return length === 12 || length === 24;
};

export const generateMnemonic = (mnemonicLength: MnemonicLength): string[] => {
    const inputs: string[] = [];
    const mnemonicKeys = LumUtils.generateMnemonic(mnemonicLength).split(' ');

    for (let i = 0; i < mnemonicLength; i++) {
        inputs.push(mnemonicKeys[i]);
    }

    return inputs;
};

export const generateKeystoreFile = (password: string): LumUtils.KeyStore => {
    const privateKey = LumUtils.generatePrivateKey();

    return LumUtils.generateKeyStore(privateKey, password);
};

export const checkPwdStrength = (password: string): PasswordStrength => {
    const strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{9,})');
    const mediumPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{9,})');

    if (strongPassword.test(password)) {
        return PasswordStrengthType.Strong;
    } else if (mediumPassword.test(password)) {
        return PasswordStrengthType.Medium;
    }
    return PasswordStrengthType.Weak;
};

type TxInfos = {
    fromAddress: string;
    toAddress: string;
    amount: Amount[];
};

const isTxInfo = (info: { fromAddress?: string; toAddress?: string; amount?: Amount[] } | null): info is TxInfos => {
    return !!(info && info.fromAddress && info.toAddress && info.amount);
};

export const formatTxs = (rawTxs: TxResponse[]): Transaction[] => {
    const formattedTxs: Transaction[] = [];

    rawTxs.forEach((rawTx) => {
        // Decode TX to human readable format
        const txData = LumRegistry.decodeTx(rawTx.tx);

        txData.body?.messages?.forEach((msg) => {
            if (msg.typeUrl === LumMessages.MsgSendUrl) {
                const txInfos = LumUtils.toJSON(LumRegistry.decode(msg));

                if (typeof txInfos === 'object' && isTxInfo(txInfos)) {
                    formattedTxs.push({
                        ...txInfos,
                        hash: LumUtils.toHex(rawTx.hash).toUpperCase(),
                    });
                }
            }
        });
    });

    return formattedTxs;
};

export const generateSignedMessage = async (wallet: LumWallet, message: string): Promise<LumTypes.SignMsg> => {
    return await wallet.signMessage(message);
};

export const validateSignMessage = async (msg: LumTypes.SignMsg): Promise<boolean> => {
    return await LumUtils.verifySignMsg(msg);
};

class WalletClient {
    lumClient: LumClient | null = null;

    init = async (): Promise<void> => {
        this.lumClient = await LumClient.connect(LUM_TESTNET);
    };

    private getAccountAndChainId = (fromWallet: LumWallet) => {
        if (this.lumClient === null) {
            return;
        }

        return Promise.all([this.lumClient.getAccount(fromWallet.getAddress()), this.lumClient.getChainId()]);
    };

    getWalletInformations = async (address: string) => {
        if (this.lumClient === null) {
            return null;
        }

        try {
            const account = await this.lumClient.getAccountUnverified(address);
            if (account === null) {
                return null;
            }
            const balance = await this.lumClient.getBalanceUnverified(address, 'lum');

            const transactions = await this.lumClient.searchTx([
                LumUtils.searchTxFrom(address),
                LumUtils.searchTxTo(address),
            ]);

            const formattedTxs = formatTxs(transactions);

            console.log(formattedTxs);

            return { ...account, ...(balance && { currentBalance: balance.amount }), transactions: formattedTxs };
        } catch (e) {
            console.log(e);
        }
    };

    sendTx = async (fromWallet: LumWallet, toAddress: string, amount: string, memo = '') => {
        if (this.lumClient === null) {
            return;
        }

        // Build transaction message
        const sendMsg = LumMessages.BuildMsgSend(fromWallet.getAddress(), toAddress, [
            { denom: LumConstants.LumDenom, amount },
        ]);
        // Define fees (5 LUM)
        const fee = {
            amount: [{ denom: LumConstants.LumDenom, amount: '100' }],
            gas: '100000',
        };
        // Fetch account number and sequence and chain id
        const result = await this.getAccountAndChainId(fromWallet);

        if (!result) {
            return;
        }

        const [account, chainId] = result;

        if (!account || !chainId) {
            return;
        }

        // Create the transaction document
        const doc = {
            accountNumber: account.accountNumber,
            chainId,
            fee,
            memo,
            messages: [sendMsg],
            sequence: account.sequence,
        };
        // Sign and broadcast the transaction using the client
        const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, doc);
        // Verify the transaction was successfully broadcasted and made it into a block
        console.log(`Broadcast success: ${LumUtils.broadcastTxCommitSuccess(broadcastResult)}`);
    };

    delegate = async (fromWallet: LumWallet, validatorAddress: string, amount: string, memo: string) => {
        if (this.lumClient === null) {
            return;
        }

        const delegateMsg = LumMessages.BuildMsgDelegate(fromWallet.getAddress(), validatorAddress, {
            denom: LumConstants.LumDenom,
            amount,
        });

        // Define fees (5 LUM)
        const fee = {
            amount: [{ denom: LumConstants.LumDenom, amount: '5' }],
            gas: '200000',
        };

        // Fetch account number and sequence and chain id
        const result = await this.getAccountAndChainId(fromWallet);

        if (!result) {
            return;
        }

        const [account, chainId] = result;

        if (!account || !chainId) {
            return;
        }

        const doc = {
            accountNumber: account.accountNumber,
            chainId,
            fee,
            memo,
            messages: [delegateMsg],
            sequence: account.sequence,
        };

        const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, doc);
        // Verify the transaction was successfully broadcasted and made it into a block
        console.log(`Broadcast success: ${LumUtils.broadcastTxCommitSuccess(broadcastResult)}`);
    };

    undelegate = async (fromWallet: LumWallet, validatorAddress: string, amount: string, memo: string) => {
        if (this.lumClient === null) {
            return;
        }

        const undelegateMsg = LumMessages.BuildMsgUndelegate(fromWallet.getAddress(), validatorAddress, {
            denom: LumConstants.LumDenom,
            amount,
        });

        // Define fees (5 LUM)
        const fee = {
            amount: [{ denom: LumConstants.LumDenom, amount: '5' }],
            gas: '200000',
        };

        // Fetch account number and sequence and chain id
        const result = await this.getAccountAndChainId(fromWallet);

        if (!result) {
            return;
        }

        const [account, chainId] = result;

        if (!account || !chainId) {
            return;
        }

        const doc = {
            accountNumber: account.accountNumber,
            chainId,
            fee,
            memo,
            messages: [undelegateMsg],
            sequence: account.sequence,
        };

        const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, doc);
        // Verify the transaction was successfully broadcasted and made it into a block
        console.log(`Broadcast success: ${LumUtils.broadcastTxCommitSuccess(broadcastResult)}`);
    };

    getReward = async (fromWallet: LumWallet, validatorAddress: string, memo: string) => {
        if (this.lumClient === null) {
            return;
        }

        const getRewardMsg = LumMessages.BuildMsgWithdrawDelegatorReward(fromWallet.getAddress(), validatorAddress);

        // Define fees (5 LUM)
        const fee = {
            amount: [{ denom: LumConstants.LumDenom, amount: '1' }],
            gas: '140000',
        };

        // Fetch account number and sequence and chain id
        const result = await this.getAccountAndChainId(fromWallet);

        if (!result) {
            return;
        }

        const [account, chainId] = result;

        if (!account || !chainId) {
            return;
        }

        const doc = {
            accountNumber: account.accountNumber,
            chainId,
            fee,
            memo,
            messages: [getRewardMsg],
            sequence: account.sequence,
        };

        const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, doc);
        // Verify the transaction was successfully broadcasted and made it into a block
        console.log(`Broadcast success: ${LumUtils.broadcastTxCommitSuccess(broadcastResult)}`);
    };

    redelegate = async (
        fromWallet: LumWallet,
        validatorScrAddress: string,
        validatorDestAddress: string,
        amount: string,
        memo: string,
    ) => {
        if (this.lumClient === null) {
            return;
        }

        const redelegateMsg = LumMessages.BuildMsgBeginRedelegate(
            fromWallet.getAddress(),
            validatorScrAddress,
            validatorDestAddress,
            {
                amount,
                denom: LumConstants.LumDenom,
            },
        );

        // Define fees (5 LUM)
        const fee = {
            amount: [{ denom: LumConstants.LumDenom, amount: '1' }],
            gas: '300000',
        };

        // Fetch account number and sequence and chain id
        const result = await this.getAccountAndChainId(fromWallet);

        if (!result) {
            return;
        }

        const [account, chainId] = result;

        if (!account || !chainId) {
            return;
        }

        const doc = {
            accountNumber: account.accountNumber,
            chainId,
            fee,
            memo,
            messages: [redelegateMsg],
            sequence: account.sequence,
        };

        const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, doc);
        // Verify the transaction was successfully broadcasted and made it into a block
        console.log(`Broadcast success: ${LumUtils.broadcastTxCommitSuccess(broadcastResult)}`);
    };
}

export default new WalletClient();

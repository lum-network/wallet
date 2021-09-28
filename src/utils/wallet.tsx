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
import { PasswordStrengthType, PasswordStrength, Transaction } from 'models';
import { dateFromNow, showErrorToast } from 'utils';

export type MnemonicLength = 12 | 24;

export const IS_TESTNET = process.env.REACT_APP_RPC_URL.includes('testnet');

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

type SendTxInfos = {
    fromAddress: string;
    toAddress: string;
    amount: LumTypes.Coin[];
};

type StakingTxInfos = {
    validatorAddress: string;
    delegatorAddress: string;
    amount: LumTypes.Coin;
};

const isSendTxInfo = (
    info: {
        fromAddress?: string;
        toAddress?: string;
        amount?: LumTypes.Coin[];
    } | null,
): info is SendTxInfos => {
    return !!(info && info.fromAddress && info.toAddress && info.amount);
};

const isStakingTxInfo = (
    info: {
        delegatorAddress?: string;
        validatorAddress?: string;
        amount?: LumTypes.Coin;
    } | null,
): info is StakingTxInfos => {
    return !!(info && info.validatorAddress && info.delegatorAddress && info.amount);
};

export const formatTxs = async (rawTxs: TxResponse[], client: LumClient): Promise<Transaction[]> => {
    const formattedTxs: Transaction[] = [];

    for (const rawTx of rawTxs) {
        // Decode TX to human readable format
        const txData = LumRegistry.decodeTx(rawTx.tx);

        if (txData.body && txData.body.messages) {
            for (const msg of txData.body.messages) {
                const txInfos = LumUtils.toJSON(LumRegistry.decode(msg));
                if (typeof txInfos === 'object') {
                    const block = await client.getBlock(rawTx.height);

                    if (isSendTxInfo(txInfos)) {
                        formattedTxs.push({
                            ...txInfos,
                            type: msg.typeUrl,
                            height: rawTx.height,
                            hash: LumUtils.toHex(rawTx.hash).toUpperCase(),
                            time: dateFromNow(block.block.header.time.getTime()),
                        });
                    } else if (isStakingTxInfo(txInfos)) {
                        const fromAddress = txInfos.delegatorAddress;
                        const toAddress = txInfos.validatorAddress;

                        formattedTxs.push({
                            fromAddress,
                            toAddress,
                            type: msg.typeUrl,
                            amount: [txInfos.amount],
                            height: rawTx.height,
                            hash: LumUtils.toHex(rawTx.hash).toUpperCase(),
                            time: dateFromNow(block.block.header.time.getTime()),
                        });
                    }
                }
            }
        }
    }

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

    init = () => {
        LumClient.connect(process.env.REACT_APP_RPC_URL)
            .then((client) => (this.lumClient = client))
            .catch(() => showErrorToast('Unable to connect to the blockchain'));
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
            const account = await this.lumClient.getAccount(address);
            if (account === null) {
                return null;
            }
            let currentBalance = 0;

            this.lumClient
                .getAllBalances(address)
                .then((balances) => {
                    if (balances.length > 0) {
                        for (const balance of balances) {
                            currentBalance += Number(LumUtils.convertUnit(balance, LumConstants.LumDenom));
                        }
                    }
                })
                .catch((e) => console.log(e));

            const transactions = await this.lumClient.searchTx([
                LumUtils.searchTxByTags([{ key: 'transfer.recipient', value: address }]),
                LumUtils.searchTxByTags([{ key: 'transfer.sender', value: address }]),
            ]);

            const formattedTxs = await formatTxs(transactions, this.lumClient);

            return { ...account, currentBalance, transactions: formattedTxs };
        } catch (e) {
            console.log(e);
        }
    };

    sendTx = async (fromWallet: LumWallet, toAddress: string, lumAmount: string, memo = '') => {
        if (this.lumClient === null) {
            return null;
        }

        // Convert Lum to uLum
        const amount = LumUtils.convertUnit(
            { denom: LumConstants.LumDenom, amount: lumAmount },
            LumConstants.MicroLumDenom,
        );

        // Build transaction message
        const sendMsg = LumMessages.BuildMsgSend(fromWallet.getAddress(), toAddress, [
            { denom: LumConstants.MicroLumDenom, amount },
        ]);
        // Define fees (5 LUM)
        const fee = {
            amount: [{ denom: LumConstants.MicroLumDenom, amount: '1000' }],
            gas: '100000',
        };
        // Fetch account number and sequence and chain id
        const result = await this.getAccountAndChainId(fromWallet);

        if (!result) {
            return null;
        }

        const [account, chainId] = result;

        if (!account || !chainId) {
            return null;
        }

        const { accountNumber, sequence } = account;
        // Create the transaction document
        const doc: LumTypes.Doc = {
            chainId,
            fee,
            memo,
            messages: [sendMsg],
            signers: [
                {
                    accountNumber,
                    sequence,
                    publicKey: fromWallet.getPublicKey(),
                },
            ],
        };
        // Sign and broadcast the transaction using the client
        const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, doc);
        // Verify the transaction was successfully broadcasted and made it into a block
        const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

        console.log(`Broadcast success: ${broadcasted}`);

        return {
            hash: broadcastResult.hash,
            error: !broadcasted
                ? broadcastResult.deliverTx && broadcastResult.deliverTx.log
                    ? broadcastResult.deliverTx.log
                    : broadcastResult.checkTx.log
                : null,
        };
    };

    delegate = async (fromWallet: LumWallet, validatorAddress: string, lumAmount: string, memo: string) => {
        if (this.lumClient === null) {
            return null;
        }

        // Convert Lum to uLum
        const amount = LumUtils.convertUnit(
            { denom: LumConstants.LumDenom, amount: lumAmount },
            LumConstants.MicroLumDenom,
        );

        const delegateMsg = LumMessages.BuildMsgDelegate(fromWallet.getAddress(), validatorAddress, {
            denom: LumConstants.MicroLumDenom,
            amount,
        });

        // Define fees (5 LUM)
        const fee = {
            amount: [{ denom: LumConstants.MicroLumDenom, amount: '5' }],
            gas: '200000',
        };

        // Fetch account number and sequence and chain id
        const result = await this.getAccountAndChainId(fromWallet);

        if (!result) {
            return null;
        }

        const [account, chainId] = result;

        if (!account || !chainId) {
            return null;
        }

        const { accountNumber, sequence } = account;

        const doc: LumTypes.Doc = {
            chainId,
            fee,
            memo,
            messages: [delegateMsg],
            signers: [
                {
                    accountNumber,
                    sequence,
                    publicKey: fromWallet.getPublicKey(),
                },
            ],
        };

        const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, doc);
        // Verify the transaction was successfully broadcasted and made it into a block
        const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

        console.log(`Broadcast success: ${broadcasted}`);

        return {
            hash: broadcastResult.hash,
            error: !broadcasted
                ? broadcastResult.deliverTx && broadcastResult.deliverTx.log
                    ? broadcastResult.deliverTx.log
                    : broadcastResult.checkTx.log
                : null,
        };
    };

    undelegate = async (fromWallet: LumWallet, validatorAddress: string, lumAmount: string, memo: string) => {
        if (this.lumClient === null) {
            return null;
        }

        // Convert Lum to uLum
        const amount = LumUtils.convertUnit(
            { denom: LumConstants.LumDenom, amount: lumAmount },
            LumConstants.MicroLumDenom,
        );

        const undelegateMsg = LumMessages.BuildMsgUndelegate(fromWallet.getAddress(), validatorAddress, {
            denom: LumConstants.MicroLumDenom,
            amount,
        });

        // Define fees (5 LUM)
        const fee = {
            amount: [{ denom: LumConstants.MicroLumDenom, amount: '5' }],
            gas: '200000',
        };

        // Fetch account number and sequence and chain id
        const result = await this.getAccountAndChainId(fromWallet);

        if (!result) {
            return null;
        }

        const [account, chainId] = result;

        if (!account || !chainId) {
            return null;
        }

        const { accountNumber, sequence } = account;
        const doc: LumTypes.Doc = {
            chainId,
            fee,
            memo,
            messages: [undelegateMsg],

            signers: [
                {
                    accountNumber,
                    sequence,
                    publicKey: fromWallet.getPublicKey(),
                },
            ],
        };

        const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, doc);
        // Verify the transaction was successfully broadcasted and made it into a block
        const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

        console.log(`Broadcast success: ${broadcasted}`);

        return {
            hash: broadcastResult.hash,
            error: !broadcasted
                ? broadcastResult.deliverTx && broadcastResult.deliverTx.log
                    ? broadcastResult.deliverTx.log
                    : broadcastResult.checkTx.log
                : null,
        };
    };

    getReward = async (fromWallet: LumWallet, validatorAddress: string, memo: string) => {
        if (this.lumClient === null) {
            return null;
        }

        const getRewardMsg = LumMessages.BuildMsgWithdrawDelegatorReward(fromWallet.getAddress(), validatorAddress);

        // Define fees (5 LUM)
        const fee = {
            amount: [{ denom: LumConstants.MicroLumDenom, amount: '1' }],
            gas: '140000',
        };

        // Fetch account number and sequence and chain id
        const result = await this.getAccountAndChainId(fromWallet);

        if (!result) {
            return null;
        }

        const [account, chainId] = result;

        if (!account || !chainId) {
            return null;
        }

        const { accountNumber, sequence } = account;

        const doc: LumTypes.Doc = {
            chainId,
            fee,
            memo,
            messages: [getRewardMsg],
            signers: [
                {
                    accountNumber,
                    sequence,
                    publicKey: fromWallet.getPublicKey(),
                },
            ],
        };

        const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, doc);
        // Verify the transaction was successfully broadcasted and made it into a block
        const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

        console.log(`Broadcast success: ${broadcasted}`);

        return {
            hash: broadcastResult.hash,
            error: !broadcasted
                ? broadcastResult.deliverTx && broadcastResult.deliverTx.log
                    ? broadcastResult.deliverTx.log
                    : broadcastResult.checkTx.log
                : null,
        };
    };

    redelegate = async (
        fromWallet: LumWallet,
        validatorScrAddress: string,
        validatorDestAddress: string,
        lumAmount: string,
        memo: string,
    ) => {
        if (this.lumClient === null) {
            return null;
        }

        // Convert Lum to uLum
        const amount = LumUtils.convertUnit(
            { denom: LumConstants.LumDenom, amount: lumAmount },
            LumConstants.MicroLumDenom,
        );

        const redelegateMsg = LumMessages.BuildMsgBeginRedelegate(
            fromWallet.getAddress(),
            validatorScrAddress,
            validatorDestAddress,
            {
                amount,
                denom: LumConstants.MicroLumDenom,
            },
        );

        // Define fees (5 LUM)
        const fee = {
            amount: [{ denom: LumConstants.MicroLumDenom, amount: '1' }],
            gas: '300000',
        };

        // Fetch account number and sequence and chain id
        const result = await this.getAccountAndChainId(fromWallet);

        if (!result) {
            return null;
        }

        const [account, chainId] = result;

        if (!account || !chainId) {
            return null;
        }

        const { accountNumber, sequence } = account;

        const doc: LumTypes.Doc = {
            chainId,
            fee,
            memo,
            messages: [redelegateMsg],
            signers: [
                {
                    accountNumber,
                    sequence,
                    publicKey: fromWallet.getPublicKey(),
                },
            ],
        };

        const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, doc);
        // Verify the transaction was successfully broadcasted and made it into a block
        const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

        console.log(`Broadcast success: ${broadcasted}`);

        return {
            hash: broadcastResult.hash,
            error: !broadcasted
                ? broadcastResult.deliverTx && broadcastResult.deliverTx.log
                    ? broadcastResult.deliverTx.log
                    : broadcastResult.checkTx.log
                : null,
        };
    };
}

export default new WalletClient();

import { LumUtils, LumClient, LumMessages, LumWallet, LumRegistry, LumTypes } from '@lum-network/sdk-javascript';
import { TxResponse } from '@cosmjs/tendermint-rpc';
import { LUM_TESTNET } from 'constant';
import { PasswordStrengthType, PasswordStrength } from 'models';

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

export const formatTxs = (rawTxs: TxResponse[]): unknown[] => {
    const formattedTxs: unknown[] = [];

    rawTxs.forEach((rawTx) => {
        // Decode TX to human readable format
        const txData = LumRegistry.decodeTx(rawTx.tx);

        txData.body?.messages?.forEach((msg) => {
            if (msg.typeUrl === LumMessages.MsgSendUrl) {
                formattedTxs.push({
                    hash: LumUtils.toHex(rawTx.hash).toUpperCase(),
                    ...Object.assign({}, LumUtils.toJSON(LumRegistry.decode(msg))),
                });
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

            return { ...account, ...(balance && { currentBalance: balance.amount }), transactions: formattedTxs };
        } catch (e) {
            console.log(e);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sendTx = async (_fromWallet: LumWallet, _to: string, _amount: string) => {
        if (this.lumClient === null) {
            return;
        }

        // Sign and broadcast the transaction using the client
        //const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, [sendMsg], fee, 'hello memo!');
        // Verify the transaction was succesfully broadcasted and made it into a block
        //console.log(`Broadcast success: ${LumUtils.broadcastTxCommitSuccess(broadcastResult)}`);
    };
}

export default new WalletClient();

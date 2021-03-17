import { LumUtils, LumClient, LumMessages, LumConstants, LumWallet } from '@lum-network/sdk-javascript';
import { LUM_TESTNET } from 'constant';
import { PasswordStrengthType, PasswordStrength } from 'models';

export type MnemonicLength = 12 | 24;

export const checkMnemonicLength = (length: number): length is MnemonicLength => {
    return length === 12 || length === 24;
};

class WalletUtils {
    lumClient: LumClient | null = null;

    init = async (): Promise<void> => {
        this.lumClient = await LumClient.connect(LUM_TESTNET);
    };

    generateMnemonic = (mnemonicLength: MnemonicLength): string[] => {
        const inputs: string[] = [];
        const mnemonicKeys = LumUtils.generateMnemonic(mnemonicLength).split(' ');

        for (let i = 0; i < mnemonicLength; i++) {
            inputs.push(mnemonicKeys[i]);
        }

        return inputs;
    };

    generateKeystoreFile = (password: string): LumUtils.KeyStore => {
        const privateKey = LumUtils.generatePrivateKey();

        return LumUtils.generateKeyStore(privateKey, password);
    };

    checkPwdStrength = (password: string): PasswordStrength => {
        const strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{9,})');
        const mediumPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{9,})');

        if (strongPassword.test(password)) {
            return PasswordStrengthType.Strong;
        } else if (mediumPassword.test(password)) {
            return PasswordStrengthType.Medium;
        }
        return PasswordStrengthType.Weak;
    };

    getWalletInformations = async (address: string) => {
        if (this.lumClient) {
            try {
                const account = await this.lumClient.getAccountUnverified(address);
                return account;
            } catch (e) {
                console.log(e);
            }
        }
        return null;
    };

    sendTx = async (fromWallet: LumWallet, to: string, amount: string) => {
        if (this.lumClient) {
            const sendMsg = LumMessages.BuildMsgSend(fromWallet.address, to, [
                { denom: LumConstants.LumDenom, amount },
            ]);

            const fee = {
                amount: [{ denom: LumConstants.LumDenom, amount: '1' }],
                gas: '100000',
            };

            // Sign and broadcast the transaction using the client
            const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, [sendMsg], fee, 'hello memo!');
            // Verify the transaction was succesfully broadcasted and made it into a block
            console.log(`Broadcast success: ${LumUtils.broadcastTxCommitSuccess(broadcastResult)}`);
        }
    };
}

export default new WalletUtils();

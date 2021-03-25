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
        if (this.lumClient === null) {
            return null;
        }

        try {
            const account = await this.lumClient.getAccountUnverified(address);
            if (account === null) {
                return null;
            }
            const balance = await this.lumClient.getBalanceUnverified(address, 'lum');

            /* const transactions = await this.lumClient.searchTx([
                LumUtils.searchTxFrom(address),
                LumUtils.searchTxTo(address),
            ]); */

            return { ...account, ...(balance && { currentBalance: balance.amount }) };
        } catch (e) {
            console.log(e);
        }
    };

    sendTx = async (fromWallet: LumWallet, to: string, amount: string) => {
        if (this.lumClient === null) {
            return;
        }

        // Sign and broadcast the transaction using the client
        //const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, [sendMsg], fee, 'hello memo!');
        // Verify the transaction was succesfully broadcasted and made it into a block
        //console.log(`Broadcast success: ${LumUtils.broadcastTxCommitSuccess(broadcastResult)}`);
    };

    /* generateSignedMessage = async (wallet: LumWallet, message: string): Promise<SignMessageObject | null> => {
        if (this.lumClient) {
            const account = this.getWalletInformations(wallet.getAddress());
            const hashedMessage = Crypto.createHash('sha256').update(message).digest('hex');
            const chainId = await this.lumClient.getChainId();
            const { accountNumber, sequence, address } = wallet.account;
            const doc: LumTypes.Doc = {
                accountNumber,
                sequence,
                fee: { amount: [{ denom: LumConstants.LumDenom, amount: '0' }], gas: '10000' },
                messages: [{ value: message, typeUrl: LumMessages.MsgSendUrl }],
                chainId,
            };
            const signDoc = LumUtils.generateSignDoc(doc, wallet.getPublicKey(), wallet.signingMode());
            const signedDoc = LumUtils.generateSignDocBytes(signDoc);
            const signature = await wallet.signTransaction(doc);

            const verifiedSig = await LumUtils.verifySignature(signature, signedDoc, wallet.getPublicKey());
            console.log(verifiedSig);
            const sig = LumUtils.keyToHex(signedDoc);
            const siBytes = LumUtils.keyToHex(signedDoc);
            console.log(sig);

            return {
                address,
                msg: message,
                sig,
                version: '1',
                signer: 'LUM Wallet',
            };
        }

        return null;
    };

    validateSignMessage = async (wallet: LumWallet, signedMessage: string) => {
        const account = this.getWalletInformations(wallet.getAddress());
        const json: SignMessageObject = JSON.parse(signedMessage);
        const sig = Buffer.from(json.sig.replace('0x', ''), 'hex');
        const { r, v, s } = fromRpcSig(json.sig);
        console.log(json);
        const pubKey = ecrecover(toBuffer(json.msg), v, r, s);
        console.log(LumUtils.getAddressFromPublicKey(pubKey));
        const decodedPubKey = LumTypes.PubKey.decode(LumUtils.keyFromHex(json.sig));
        console.log(decodedPubKey);
    }; */
}

export default new WalletUtils();

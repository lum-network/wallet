import { Window as KeplrWindow } from '@keplr-wallet/types';

import { LumConstants } from 'constant';

import { KeyStore, PasswordStrength, PasswordStrengthType, SignMsg, Wallet } from 'models';

import * as LumUtils from './lum';

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

export const generateKeystoreFile = (password: string): KeyStore => {
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

export const generateSignedMessage = async (chainId: string, wallet: Wallet, msg: string): Promise<SignMsg | null> => {
    if (wallet.isExtensionImport) {
        const keplrWindow = window as KeplrWindow;

        if (!keplrWindow.keplr) {
            throw new Error('Keplr is not installed');
        }

        const signMsg = await keplrWindow.keplr.signArbitrary(chainId, wallet.address, msg);
        if (signMsg) {
            return {
                msg,
                address: wallet.address,
                publicKey: LumUtils.fromBase64(signMsg.pub_key.value),
                sig: LumUtils.fromBase64(signMsg.signature),
                version: LumConstants.LumWalletSigningVersion,
                signer: LumConstants.LumMessageSigner.OFFLINE,
            };
        } else {
            throw new Error('Unable to sign message');
        }
    }

    return null;
};

export const validateSignMessage = async (chainId: string, msg: SignMsg): Promise<boolean> => {
    if (msg.signer === LumConstants.LumMessageSigner.OFFLINE) {
        const keplrWindow = window as KeplrWindow;

        if (!keplrWindow.keplr) {
            throw new Error('Keplr is needed to verify a message signed with keplr');
        }

        return await keplrWindow.keplr.verifyArbitrary(chainId, msg.address, msg.msg, {
            signature: LumUtils.toBase64(msg.sig),
            pub_key: {
                type: 'tendermint/PubKeySecp256k1',
                value: LumUtils.toBase64(msg.publicKey),
            },
        });
    }

    return false;
};

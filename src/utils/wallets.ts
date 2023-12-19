import { Random } from '@cosmjs/crypto';
import { Window as KeplrWindow } from '@keplr-wallet/types';

import { LumConstants } from 'constant';

import { PasswordStrength, PasswordStrengthType, SignMsg, Wallet } from 'models';

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

/**
 * Generates a cryptographically secure random private key
 */
export const generatePrivateKey = (): Uint8Array => {
    return Random.getBytes(32);
};

export const generateKeystoreFile = (password: string): KeyStore => {
    const privateKey = generatePrivateKey();

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

/**
 * KeyStore storage format (web3 secret storage format)
 */
export interface KeyStore {
    version: number;
    id: string;
    crypto: {
        ciphertext: string;
        cipherparams: {
            iv: string;
        };
        cipher: string;
        kdf: string;
        kdfparams: {
            dklen: number;
            salt: string;
            c: number;
            prf: string;
        };
        /** Must use sha3 according to web3 secret storage spec. */
        mac: string;
    };
}

/**
 * Generate a KeyStore using a privateKey and a password
 *
 * @param privateKey private key to encrypt in the keystore
 * @param password keystore password
 */
/* export const generateKeyStore = (privateKey: Uint8Array, password: string): KeyStore => {
    const salt = cryp.randomBytes(32);
    const iv = cryp.randomBytes(16);
    const cipherAlg = 'aes-256-ctr';

    const privateKeyHex = LumUtils.keyToHex(privateKey);

    const kdf = 'pbkdf2';
    const kdfparams = {
        dklen: 32,
        salt: salt.toString('hex'),
        c: 262144,
        prf: 'hmac-sha256',
    };

    const derivedKey = cryp.pbkdf2Sync(Buffer.from(password), salt, kdfparams.c, kdfparams.dklen, 'sha256');
    const cipher = cryp.createCipheriv(cipherAlg, derivedKey.slice(0, 32), iv);
    if (!cipher) {
        throw new Error('Unsupported cipher');
    }

    const ciphertext = Buffer.concat([cipher.update(Buffer.from(privateKeyHex, 'hex')), cipher.final()]);
    const bufferValue = Buffer.concat([derivedKey.slice(16, 32), Buffer.from(ciphertext.toString('hex'), 'hex')]);

    return {
        version: 1,
        id: uuid.v4({
            random: cryp.randomBytes(16),
        }),
        crypto: {
            ciphertext: ciphertext.toString('hex'),
            cipherparams: {
                iv: iv.toString('hex'),
            },
            cipher: cipherAlg,
            kdf,
            kdfparams: kdfparams,
            // mac must use sha3 according to web3 secret storage spec
            mac: LumUtils.sha3(bufferValue.toString('hex')),
        },
    };
}; */

/**
 * Decyphers the private key from the provided KeyStore
 *
 * @param keystore keystore data (either stringified or loaded)
 * @param password keystore password
 */
/* export const getPrivateKeyFromKeystore = (keystore: string | KeyStore, password: string): Uint8Array => {
    if (typeof window === undefined) {
        throw new Error('Crypto module is unavailable');
    }

    const store: KeyStore = typeof keystore === 'string' ? JSON.parse(keystore) : keystore;
    if (store.crypto.kdfparams.prf !== 'hmac-sha256') {
        throw new Error('Unsupported parameters to PBKDF2');
    }

    const derivedKey = cryp.PBKDF2(password, store.crypto.kdfparams.salt, {
        iterations: store.crypto.kdfparams.c,
        keySize: 256 / store.crypto.kdfparams.dklen,
    });

    const ciphertext = Buffer.from(store.crypto.ciphertext, 'hex');
    const bufferValue = Buffer.concat([LumUtils.fromHex(derivedKey.toString().slice(16, 32)), ciphertext]);

    // try sha3 (new / ethereum keystore) mac first
    const mac = LumUtils.sha3(bufferValue.toString('hex'));
    if (mac !== store.crypto.mac) {
        // the legacy (sha256) mac is next to be checked. pre-testnet keystores used a sha256 digest for the mac.
        // the sha256 mac was not compatible with ethereum keystores, so it was changed to sha3 for mainnet.
        const macLegacy = sha256(bufferValue);
        if (LumUtils.toHex(macLegacy) !== store.crypto.mac) {
            throw new Error('Keystore mac check failed (sha3 & sha256) - wrong password?');
        }
    }

    const decipher = cryp.createDecipheriv(
        store.crypto.cipher,
        derivedKey.slice(0, 32),
        Buffer.from(store.crypto.cipherparams.iv, 'hex'),
    );
    return new Uint8Array(Buffer.concat([decipher.update(ciphertext), decipher.final()]));
}; */

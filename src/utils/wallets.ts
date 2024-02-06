import { StdSignDoc } from '@cosmjs/amino';
import { Secp256k1, Secp256k1Signature, ripemd160 } from '@cosmjs/crypto';
import { verifyADR36AminoSignDoc } from '@keplr-wallet/cosmos';

import {
    sha256,
    generateKeyStore,
    generatePrivateKey,
    generateMnemonic as genMnemonic,
    LumBech32Prefixes,
    toBech32,
    fromBase64,
    LUM_WALLET_SIGNING_VERSION,
    LumMessageSigner,
    fromBech32,
    toAscii,
    sortJSON,
    toBase64,
} from '@lum-network/sdk-javascript';
import { PubKey } from '@lum-network/sdk-javascript/build/codegen/cosmos/crypto/secp256k1/keys';
import { Any } from '@lum-network/sdk-javascript/build/codegen/google/protobuf/any';

import { KeyStore, PasswordStrength, PasswordStrengthType, SignMsg, Wallet } from 'models';
import { WalletClient } from 'utils';

export type MnemonicLength = 12 | 24;

export const checkMnemonicLength = (length: number): length is MnemonicLength => {
    return length === 12 || length === 24;
};

export const generateMnemonic = (mnemonicLength: MnemonicLength): string[] => {
    const inputs: string[] = [];
    const mnemonicKeys = genMnemonic(mnemonicLength).split(' ');

    for (let i = 0; i < mnemonicLength; i++) {
        inputs.push(mnemonicKeys[i]);
    }

    return inputs;
};

export const generateKeystoreFile = (password: string): KeyStore => {
    const privateKey = generatePrivateKey();

    return generateKeyStore(privateKey, password);
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

/**
 * Converts a public key into its protorpc version
 *
 * @param publicKey public key to convert into proto
 */
export const publicKeyToProto = (publicKey: Uint8Array): Any => {
    const pubkeyProto = PubKey.fromPartial({ key: publicKey });
    return Any.fromPartial({
        typeUrl: '/cosmos.crypto.secp256k1.PubKey',
        value: Uint8Array.from(PubKey.encode(pubkeyProto).finish()),
    });
};

/**
 * Derives a bech32 wallet address from a public key (secp256k1)
 *
 * @param publicKey public key to derive the address from
 * @param prefix address prefix to use (ex: lum)
 */
export const getAddressFromPublicKey = (publicKey: Uint8Array, prefix: string = LumBech32Prefixes.ACC_ADDR) => {
    if (publicKey.length !== 33) {
        throw new Error(`Invalid Secp256k1 pubkey length (compressed): ${publicKey.length}`);
    }
    const hash1 = sha256(publicKey);
    const hash2 = ripemd160(hash1);
    return toBech32(prefix, hash2);
};

export const generateSignedMessage = async (wallet: Wallet, msg: string): Promise<SignMsg | null> => {
    const signMsg = await WalletClient.signMessage(wallet, msg);

    if (!signMsg) {
        throw new Error('Unable to sign message');
    }

    return {
        msg,
        address: wallet.address,
        publicKey: fromBase64(signMsg.pubkey),
        sig: fromBase64(signMsg.signature),
        version: LUM_WALLET_SIGNING_VERSION,
        signer: wallet.isExtensionImport
            ? LumMessageSigner.OFFLINE
            : wallet.isLedger
            ? LumMessageSigner.LEDGER
            : LumMessageSigner.PAPER,
    };
};

/**
 * Verify that a signature is valid
 *
 * @param signature signature (as generated by the generateSignature function)
 * @param signedBytes signed bytes (as generated by the generateSignDocBytes function or by the signMessage function)
 * @param publicKey public key of the signing key pair (secp256k1)
 */
export const verifySignature = async (
    signature: Uint8Array,
    signedBytes: Uint8Array,
    publicKey: Uint8Array,
): Promise<boolean> => {
    return Secp256k1.verifySignature(Secp256k1Signature.fromFixedLength(signature), sha256(signedBytes), publicKey);
};

export const validateSignMessage = async (msg: SignMsg): Promise<boolean> => {
    const { prefix } = fromBech32(msg.address);

    if (getAddressFromPublicKey(msg.publicKey, prefix) !== msg.address) {
        return false;
    }

    if (msg.signer === LumMessageSigner.PAPER || msg.signer === LumMessageSigner.LEDGER) {
        // Re-create the signDoc used to generate the message to sign
        const msgToSign: StdSignDoc = {
            account_number: '0',
            chain_id: '',
            fee: {
                amount: [{ amount: '', denom: '' }],
                gas: '',
            },
            memo: encodeURI(msg.msg),
            msgs: [],
            sequence: '0',
        };

        return verifySignature(msg.sig, toAscii(JSON.stringify(sortJSON(msgToSign))), msg.publicKey);
    } else if (msg.signer === LumMessageSigner.OFFLINE) {
        // Re-create the signDoc similar to the one keplr has generated
        const msgToSign: StdSignDoc = {
            chain_id: '',
            account_number: '0',
            sequence: '0',
            fee: {
                amount: [],
                gas: '0',
            },
            msgs: [
                {
                    type: 'sign/MsgSignData',
                    value: {
                        signer: msg.address,
                        data: toBase64(toAscii(encodeURI(msg.msg))),
                    },
                },
            ],
            memo: '',
        };

        return verifyADR36AminoSignDoc(LumBech32Prefixes.ACC_ADDR, msgToSign, msg.publicKey, msg.sig);
    }

    throw new Error('unknown message signer');
};

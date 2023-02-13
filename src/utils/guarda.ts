import { PBKDF2, AES, enc } from 'crypto-js';
import base58 from 'bs58';
import { LumUtils } from '@lum-network/sdk-javascript';
import i18n from 'locales';

const salt = 'XB7sHH26Hn&FmPLxnjGccKTfPV(yk';
const patchMasterPassword = (pass: string) => `${PBKDF2(pass, salt)}(tXntTbJFzh]4EuQVmjzM9GXHCth8`;

const fromb58toHex = (
    input: string, //Base58 encoded string input
) => {
    const byteArray = base58.decode(input); //convert base58 encoded string to byte array

    return Buffer.from(byteArray).toString('hex'); //return the final byte array in Uint8Array format
};

export const getCosmosPrivateKey = (backup: string, pwd: string): Uint8Array => {
    try {
        const masterPassword = patchMasterPassword(pwd);
        const stringifyData = AES.decrypt(backup, masterPassword).toString(enc.Utf8);

        if (!stringifyData) {
            throw new Error(i18n.t('welcome.softwareModal.guardaBackup.errors.decodingData'));
        }

        const data = JSON.parse(stringifyData);

        if (!data.wallets) {
            throw new Error(i18n.t('welcome.softwareModal.guardaBackup.errors.noWallets'));
        }

        const cosmosWallet = data.wallets.find((wallet: any) => wallet.address.startsWith('cosmos'));

        if (!cosmosWallet) {
            throw new Error(i18n.t('welcome.softwareModal.guardaBackup.errors.noCosmosWallet'));
        }

        let cosmosPrivateKey = fromb58toHex(cosmosWallet.privateKey);

        if (!cosmosPrivateKey) {
            throw new Error(i18n.t('welcome.softwareModal.guardaBackup.errors.decodingPvtKey'));
        }

        cosmosPrivateKey = cosmosPrivateKey.slice(2, 66);
        return LumUtils.keyFromHex(cosmosPrivateKey);
    } catch {
        throw new Error(i18n.t('welcome.softwareModal.guardaBackup.errors.import'));
    }
};

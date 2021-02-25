import { LumUtils } from '@lum-network/sdk-javascript';

export type MnemonicLength = 12 | 24;

export const generateMnemonic = (mnemonicLength: MnemonicLength): string[] => {
    const inputs: string[] = [];
    const mnemonicKeys = LumUtils.generateMnemonic(mnemonicLength).split(' ');

    for (let i = 0; i < mnemonicLength; i++) {
        inputs.push(mnemonicKeys[i]);
    }

    return inputs;
};

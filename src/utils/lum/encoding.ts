import hexEncoding from 'crypto-js/enc-hex';
import {
    toHex,
    fromHex,
    toBase64,
    fromBase64,
    toAscii,
    fromAscii,
    toUtf8,
    fromUtf8,
    toRfc3339,
    fromRfc3339,
    fromBech32,
    toBech32,
} from '@cosmjs/encoding';
import { sha256 } from '@cosmjs/crypto';
import SHA3 from 'crypto-js/sha3';
import { isUint8Array } from '@cosmjs/utils';

/**
 * Sha3 hash
 *
 * @param hex hex bytes to hash
 */
export const sha3 = (hex: string): string => {
    const hexEncoded = hexEncoding.parse(hex);
    return SHA3(hexEncoded).toString();
};

/**
 * Convert a Uint8Array key into its hexadecimal version
 *
 * @param key (should be secp256k1 but works with anything though)
 * @param xPrefix whether or not to prefix the returned hex value by "0x"
 */
export const keyToHex = (key: Uint8Array, xPrefix = false): string => {
    const hexKey = toHex(key);
    if (xPrefix) {
        return '0x' + hexKey;
    }
    return hexKey;
};

/**
 * Convert an hex key into its Uint8Array verison
 *
 * @param hexKey hexadecimal key to convert
 */
export const keyFromHex = (hexKey: string): Uint8Array => {
    if (hexKey.startsWith('0x')) {
        return fromHex(hexKey.substr(2));
    }
    return fromHex(hexKey);
};

/**
 * Converts the provided data recursively in order to obtain a json usable version by removing
 * complex types and making it serializable
 *
 * - Uint8Array will be converted to HEX
 * - Date will be converted to ISO string
 * - Anything else will not be touched
 *
 * @param data data to convert (can be anything)
 */
export const toJSON = (data: unknown): unknown => {
    if (isUint8Array(data)) {
        // Force uppercase hex format
        return toHex(data).toUpperCase();
    } else if (data instanceof Date) {
        // Otherwise custom Date class with nanosecond will be stringified as objects instead of datetime
        // Note: Nanoseconds data will be lost in the process
        return data.toISOString();
    } else if (Array.isArray(data)) {
        return data.map((v) => toJSON(v));
    } else if (typeof data === 'object') {
        const jsonObj: { [Key: string]: unknown } = {};
        const ks = data as { [key: string]: unknown };
        for (const prop in ks) {
            jsonObj[prop] = toJSON(ks[prop]);
        }
        return jsonObj;
    }
    return data;
};

export {
    sha256,
    toHex,
    fromHex,
    toBase64,
    fromBase64,
    toAscii,
    fromAscii,
    toUtf8,
    fromUtf8,
    toRfc3339,
    fromRfc3339,
    fromBech32,
    toBech32,
};

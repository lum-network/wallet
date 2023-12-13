import { Registry } from '@cosmjs/proto-signing';
import {
    cosmosProtoRegistry,
    ibcProtoRegistry,
    lumProtoRegistry,
    strideProtoRegistry,
} from '@lum-network/sdk-javascript';

export const LumRegistry = new Registry([
    ...lumProtoRegistry,
    ...cosmosProtoRegistry,
    ...ibcProtoRegistry,
    ...strideProtoRegistry,
]);

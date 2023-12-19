// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { GeneratedType, Registry } from '@cosmjs/proto-signing';
import {
    cosmosProtoRegistry,
    ibcProtoRegistry,
    lumProtoRegistry,
    strideProtoRegistry,
} from '@lum-network/sdk-javascript';

import { TextProposal } from '@lum-network/sdk-javascript/build/codegen/cosmos/gov/v1beta1/gov';
import { SoftwareUpgradeProposal } from '@lum-network/sdk-javascript/build/codegen/cosmos/upgrade/v1beta1/upgrade';
import { WithdrawAndMintProposal } from '@lum-network/sdk-javascript/build/codegen/lum/network/dfract/proposal';
import {
    ProposalRegisterPool,
    ProposalUpdatePool,
    ProposalUpdateParams,
} from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/gov';

const proposalsRegistry: ReadonlyArray<[string, GeneratedType]> = [
    ['/cosmos.gov.v1beta1.TextProposal', TextProposal],
    ['/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal', SoftwareUpgradeProposal],
    ['/lum.network.millions.ProposalRegisterPool', ProposalRegisterPool],
    ['/lum.network.millions.ProposalUpdatePool', ProposalUpdatePool],
    ['/lum.network.millions.ProposalUpdateParams', ProposalUpdateParams],
    ['/lum.network.dfract.WithdrawAndMintProposal', WithdrawAndMintProposal],
];

export const LumRegistry = new Registry([
    ...lumProtoRegistry,
    ...proposalsRegistry,
    ...cosmosProtoRegistry,
    ...ibcProtoRegistry,
    ...strideProtoRegistry,
]);

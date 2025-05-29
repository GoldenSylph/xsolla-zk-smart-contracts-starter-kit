import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

import types from './eip712Types.helper';

async function getDomain(contract: any) {
  const { fields, name, version, chainId, verifyingContract, salt, extensions } = await contract.eip712Domain();

  if (extensions.length > 0) {
    throw Error('Extensions not implemented');
  }

  const domain: any = {
    name,
    version,
    chainId,
    verifyingContract,
    salt,
  };

  for (const [i, { name }] of types.EIP712Domain.entries()) {
    if (!(fields & (1 << i))) {
      delete domain[name];
    }
  }

  return domain;
}

function domainType(domain: any) {
  return types.EIP712Domain.filter((params: any) => domain[params.name] !== undefined);
}

function hashTypedData(hre: any, domain: any, structHash: any) {
  return hre.ethers.solidityPackedKeccak256(
    ['bytes', 'bytes32', 'bytes32'],
    ['0x1901', hre.ethers.TypedDataEncoder.hashDomain(domain), structHash],
  );
}

export default {
  getDomain,
  domainType,
  domainSeparator: async (hre: any) => hre.ethers.TypedDataEncoder.hashDomain,
  hashTypedData,
  types
};

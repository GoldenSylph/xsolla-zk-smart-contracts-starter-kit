import { types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from "hardhat/types";

export default (task: any) =>
  task('same', 'Hashes deployed bytcodes and checks for similarity.')
    .addOptionalParam(
      'contract1',
      'Define first contract name or address.',
      'ERC721Factory', // random artifact name for example
      types.string,
    )
    .addOptionalParam(
      'contract2',
      'Define second contract name or address.',
      '0x58ce9155AcE85721934b03cc764040cAEFbA628E', // random address for example
      types.string,
    )
    .setAction(
      async ({ contract1, contract2 }: { contract1: string, contract2: string }, hre: HardhatRuntimeEnvironment) => {
        let bytecodeAString: string;
        let bytecodeBString: string;

        if (contract1.startsWith("0x")) {
          if (contract1.length !== 42) {
            bytecodeAString = contract1; 
          } else {
            bytecodeAString = await hre.network.provider.request({
              method: 'eth_getCode',
              params: [contract1, "latest"],
            }) as string;
          }
        } else {
          bytecodeAString = (await hre.artifacts.readArtifact(contract1)).bytecode;
        }

        if (contract2.startsWith("0x")) {
          if (contract2.length !== 42) {
            bytecodeBString = contract2; 
          } else {
            bytecodeBString = await hre.network.provider.request({
              method: 'eth_getCode',
              params: [contract2, "latest"],
            }) as string;
          }
        } else {
          bytecodeBString = (await hre.artifacts.readArtifact(contract2)).bytecode;
        }

        const bytecodeHashA = hre.ethers.keccak256(bytecodeAString);
        const bytecodeHashB = hre.ethers.keccak256(bytecodeBString);
        const isEqual = bytecodeHashA === bytecodeHashB;
        console.log(`Hash of the first:  ${bytecodeHashA}`);
        console.log(`Hash of the second: ${bytecodeHashB}`);
        console.log(`Equality: ${isEqual}`);
        return isEqual;
      },
    );

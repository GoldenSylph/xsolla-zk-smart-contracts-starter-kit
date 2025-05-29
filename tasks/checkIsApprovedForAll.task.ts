import { types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from "hardhat/types";

export default (task: any) =>
  task('approvedAll', 'Prints `isApprovedForAll` result for EIP1155 token.')
    .addOptionalParam(
      'token',
      'Define EIP1155 token instance.',
      '0x2F12C715bBd2775ECF7b5DB4C0726b9F4a181127', // random address for example
      types.string,
    )
    .addOptionalParam(
      'user',
      'Define user who holds allowance.',
      '0xdca49F439309E35B76D316303dB7BE658c619DAB', // random address for example
      types.string,
    )
    .addOptionalParam(
      'operator',
      'Define an operator of the allowance.',
      '0x2F12C715bBd2775ECF7b5DB4C0726b9F4a181127', // random address for example
      types.string,
    )
    .setAction(
      async ({ token, user, operator }: { token: string, user: string, operator: string }, hre: HardhatRuntimeEnvironment) => {
        const tokenInstance = await hre.zksyncEthers.getContractAt("IERC1155", token);
        console.log(`Token holder: ${user}`);
        console.log(`Operator: ${operator}`);
        console.log(`Is approved for all? - ${await tokenInstance.isApprovedForAll(user, operator)}`);
      },
    );
